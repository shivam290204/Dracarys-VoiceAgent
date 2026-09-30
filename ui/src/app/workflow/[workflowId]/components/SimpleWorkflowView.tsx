import { Bot, Check,Mic, PlayCircle, Save, Settings2, ShieldCheck, Sparkles, Wand2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { createToolApiV1ToolsPost } from '@/client/sdk.gen';
import { FlowNode } from '@/components/flow/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth';
import { WorkflowConfigurations } from '@/types/workflow-configurations';

interface SimpleWorkflowViewProps {
    workflowName: string;
    nodes: FlowNode[];
    setNodes: (nodes: FlowNode[]) => void;
    setIsDirty: (dirty: boolean) => void;
    saveWorkflow: (updateDefinition?: boolean) => Promise<unknown>;
    renameWorkflow: (newName: string) => Promise<void>;
    workflowConfigurations?: WorkflowConfigurations;
    saveWorkflowConfigurations: (configs: WorkflowConfigurations, newName: string) => Promise<void>;
    onGoToAdvanced: () => void;
    testerPanel: React.ReactNode;
}

export function SimpleWorkflowView({
    workflowName,
    nodes,
    setNodes,
    setIsDirty,
    saveWorkflow,
    renameWorkflow,
    workflowConfigurations,
    saveWorkflowConfigurations,
    onGoToAdvanced,
    testerPanel
}: SimpleWorkflowViewProps) {
    const [localName, setLocalName] = useState(workflowName);
    const [localObjective, setLocalObjective] = useState('');
    const [localVoice, setLocalVoice] = useState('');
    const [enableFriendLine, setEnableFriendLine] = useState(false);
    const [friendLineNumber, setFriendLineNumber] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const { getAccessToken } = useAuth();

    const startNode = nodes.find(n => n.type === 'startCall' || n.type === 'agentNode');

    useEffect(() => {
        setLocalName(workflowName);
        if (startNode && startNode.data && typeof startNode.data.prompt === 'string') {
            setLocalObjective(startNode.data.prompt);
            // Quick check to see if friend line is active based on prompt
            if (startNode.data.prompt.includes("FRIEND_LINE_ENABLED")) {
                setEnableFriendLine(true);
                // Try to extract destination number from prompt if it exists
                const match = startNode.data.prompt.match(/Destination: ([^\)]+)\)/);
                if (match && match[1]) {
                    setFriendLineNumber(match[1].trim());
                }
            }
        }
        const voice = workflowConfigurations?.model_overrides?.tts?.voice || 'default';
        setLocalVoice(voice);
    }, [workflowName, startNode, workflowConfigurations]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (localName !== workflowName) {
                await renameWorkflow(localName);
            }

            if (startNode) {
                let finalPrompt = localObjective;
                let addedToolUuid: string | undefined = undefined;

                if (enableFriendLine && !finalPrompt.includes("FRIEND_LINE_ENABLED")) {
                    finalPrompt += `\n\n[SYSTEM]: FRIEND_LINE_ENABLED (Destination: ${friendLineNumber || 'unknown'}) - You are acting as a VIP Friend Line assistant. You can route calls directly to the user's phone if they are on the VIP list or if it's an emergency.`;
                } else if (!enableFriendLine) {
                    finalPrompt = finalPrompt.replace(/\n\n\[SYSTEM\]: FRIEND_LINE_ENABLED.*/g, "");
                } else if (enableFriendLine) {
                    // Update destination if it changed
                    finalPrompt = finalPrompt.replace(/Destination: [^\)]+\)/, `Destination: ${friendLineNumber || 'unknown'})`);
                }

                // If Friend Line is enabled, create a Transfer Call tool and attach it
                if (enableFriendLine && friendLineNumber) {
                    try {
                        const token = await getAccessToken();
                        const toolRes = await createToolApiV1ToolsPost({
                            headers: { Authorization: `Bearer ${token}` },
                            body: {
                                name: `Transfer to ${friendLineNumber}`,
                                description: "Transfer the caller to the VIP line",
                                category: "transfer_call",
                                icon: "phone-forwarded",
                                icon_color: "#10B981",
                                definition: {
                                    schema_version: 1,
                                    type: "transfer_call",
                                    config: {
                                        destination: friendLineNumber,
                                        messageType: "custom",
                                        customMessage: "Transferring you to the VIP line now.",
                                        timeout: 30
                                    }
                                }
                            }
                        });
                        if (toolRes.data && toolRes.data.tool_uuid) {
                            addedToolUuid = toolRes.data.tool_uuid;
                        }
                    } catch (e) {
                        console.error("Failed to create transfer tool for Friend Line", e);
                    }
                }

                const updatedNodes = nodes.map(node => {
                    if (node.id === startNode.id) {
                        const currentTools = (node.data.tool_uuids as string[]) || [];
                        const updatedTools = addedToolUuid && !currentTools.includes(addedToolUuid)
                            ? [...currentTools, addedToolUuid]
                            : currentTools;

                        return {
                            ...node,
                            data: {
                                ...node.data,
                                prompt: finalPrompt,
                                tool_uuids: updatedTools
                            }
                        };
                    }
                    return node;
                });
                setNodes(updatedNodes);
                setIsDirty(true);
                await saveWorkflow(true);
            }

            if (workflowConfigurations) {
                const updatedConfigs = {
                    ...workflowConfigurations,
                    model_overrides: {
                        ...(workflowConfigurations.model_overrides || {}),
                        tts: {
                            ...(workflowConfigurations.model_overrides?.tts || {}),
                            voice: localVoice
                        }
                    }
                } as WorkflowConfigurations;
                await saveWorkflowConfigurations(updatedConfigs, localName);
            }

            toast.success("Agent saved successfully!");
        } catch (error) {
            toast.error("Failed to save agent settings");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const steps = [
        { id: 1, title: 'Identity', icon: Mic, description: 'Name & Voice' },
        { id: 2, title: 'Behavior', icon: Bot, description: 'Prompt & Rules' },
        { id: 3, title: 'Features', icon: Sparkles, description: 'Abilities' },
        { id: 4, title: 'Test Drive', icon: PlayCircle, description: 'Try it out' },
    ];

    return (
        <div className="flex w-full h-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
            {/* Sidebar Wizard Steps */}
            <div className="w-72 border-r border-border bg-white dark:bg-zinc-900 p-6 flex flex-col justify-between hidden md:flex">
                <div>
                    <div className="flex items-center gap-2 mb-10">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <Wand2 className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">Agent Setup</h2>
                    </div>

                    <div className="space-y-6 flex-1">
                        {steps.map((step) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;

                            return (
                                <div
                                    key={step.id}
                                    onClick={() => setCurrentStep(step.id)}
                                    className={`relative flex items-start gap-4 p-3 rounded-xl cursor-pointer transition-all ${isActive ? 'bg-primary/5 shadow-sm ring-1 ring-primary/20' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
                                >
                                    <div className={`mt-0.5 p-2 rounded-full flex items-center justify-center ${isActive ? 'bg-primary text-primary-foreground shadow-md' : isCompleted ? 'bg-green-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-muted-foreground'}`}>
                                        {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className={`font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>{step.title}</p>
                                        <p className="text-xs text-muted-foreground">{step.description}</p>
                                    </div>
                                    {isActive && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="pt-6 border-t border-border mt-auto">
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={onGoToAdvanced}>
                        <Settings2 className="w-4 h-4" />
                        Advanced Mode
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-10">
                <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
                    {/* Header mobile (hidden on desktop) */}
                    <div className="md:hidden flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold">Step {currentStep} of 4</h2>
                        <Button variant="outline" size="sm" onClick={onGoToAdvanced}>Advanced</Button>
                    </div>

                    <div className="flex-1">
                        {currentStep === 1 && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
                                <h1 className="text-4xl font-extrabold tracking-tight mb-3">Who is your agent?</h1>
                                <p className="text-lg text-muted-foreground mb-10">Give your AI a distinct identity and choose how they will sound on calls.</p>

                                <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-lg backdrop-blur-xl bg-white/50 dark:bg-zinc-900/50">
                                    <CardContent className="p-8 space-y-8">
                                        <div className="space-y-3">
                                            <Label htmlFor="agent-name" className="text-base font-semibold flex items-center gap-2">
                                                Agent Name
                                            </Label>
                                            <Input
                                                id="agent-name"
                                                value={localName}
                                                onChange={(e) => setLocalName(e.target.value)}
                                                className="text-lg h-12 bg-white/80 dark:bg-zinc-950/80"
                                                placeholder="e.g. Sarah from Support"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="agent-voice" className="text-base font-semibold">Voice Profile</Label>
                                            <Select value={localVoice} onValueChange={setLocalVoice}>
                                                <SelectTrigger className="text-lg h-12 bg-white/80 dark:bg-zinc-950/80" id="agent-voice">
                                                    <SelectValue placeholder="Select a voice" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="default">Default Voice</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col max-w-3xl">
                                <h1 className="text-4xl font-extrabold tracking-tight mb-3">How should they behave?</h1>
                                <p className="text-lg text-muted-foreground mb-8">Define the rules, knowledge, and objective for your agent.</p>

                                <Card className="flex-1 flex flex-col border-zinc-200/50 dark:border-zinc-800/50 shadow-lg bg-white/50 dark:bg-zinc-900/50">
                                    <CardContent className="p-6 flex-1 flex flex-col h-full">
                                        <Textarea
                                            value={localObjective}
                                            onChange={(e) => setLocalObjective(e.target.value)}
                                            className="flex-1 min-h-[300px] resize-none font-mono text-sm leading-relaxed p-4 bg-white/80 dark:bg-zinc-950/80 focus-visible:ring-primary/50"
                                            placeholder="You are a helpful customer support agent for..."
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
                                <h1 className="text-4xl font-extrabold tracking-tight mb-3">Special Features</h1>
                                <p className="text-lg text-muted-foreground mb-10">Give your agent superpowers to handle complex situations.</p>

                                <div className="space-y-4">
                                    <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-md hover:shadow-lg transition-shadow bg-white/50 dark:bg-zinc-900/50 overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-2">
                                            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-full">New</span>
                                        </div>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                                        <ShieldCheck className="w-5 h-5 text-primary" />
                                                        Friend Line VIP Routing
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground max-w-[400px]">
                                                        Equip this agent to act as a personal assistant, screening calls and patching through VIPs or emergencies directly to your real phone.
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={enableFriendLine}
                                                    onCheckedChange={setEnableFriendLine}
                                                />
                                            </div>
                                            {enableFriendLine && (
                                                <div className="mt-4 pt-4 border-t border-border">
                                                    <Label htmlFor="friendLineNumber" className="text-sm font-semibold mb-1.5 block">Your Phone Number</Label>
                                                    <Input
                                                        id="friendLineNumber"
                                                        placeholder="e.g. +1234567890"
                                                        value={friendLineNumber}
                                                        onChange={(e) => setFriendLineNumber(e.target.value)}
                                                        className="max-w-md bg-white/80 dark:bg-zinc-950/80"
                                                    />
                                                    <p className="text-xs text-muted-foreground mt-1.5">Include country code. The AI will transfer VIPs to this number.</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card className="border-zinc-200/50 dark:border-zinc-800/50 opacity-60 bg-zinc-50 dark:bg-zinc-900">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <h3 className="font-semibold text-lg">Calendar Booking</h3>
                                                    <p className="text-sm text-muted-foreground">Allow agent to check availability and book meetings.</p>
                                                </div>
                                                <Switch disabled />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Test Drive</h1>
                                        <p className="text-lg text-muted-foreground">Talk to your agent right now before deploying.</p>
                                    </div>
                                    <Button onClick={handleSave} disabled={isSaving} size="lg" className="px-8 shadow-xl shadow-primary/20">
                                        {isSaving ? "Saving..." : (
                                            <>
                                                <Save className="mr-2 h-5 w-5" />
                                                Publish Agent
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <div className="flex-1 w-full max-w-4xl mx-auto border border-border/50 rounded-2xl shadow-2xl bg-background overflow-hidden relative">
                                    {testerPanel}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Navigation */}
                    <div className="mt-10 flex items-center justify-between pt-6 border-t border-border/50">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                            disabled={currentStep === 1}
                            className="w-32"
                        >
                            Back
                        </Button>

                        <div className="flex gap-4 items-center">
                            {currentStep < 4 && (
                                <Button
                                    variant="ghost"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    Save Draft
                                </Button>
                            )}

                            {currentStep < 4 ? (
                                <Button
                                    onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                                    className="w-32 shadow-md"
                                >
                                    Next Step
                                </Button>
                            ) : (
                                <div className="w-32" /> // Spacer for alignment
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
