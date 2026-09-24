import { Bot, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { FlowNode } from '@/components/flow/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';


interface SimpleWorkflowViewProps {
    workflowName: string;
    workflowId: number;
    nodes: FlowNode[];
    setNodes: (nodes: FlowNode[]) => void;
    setIsDirty: (dirty: boolean) => void;
    saveWorkflow: (updateDefinition?: boolean) => Promise<unknown>;
    renameWorkflow: (newName: string) => Promise<void>;
    workflowConfigurations: { model_overrides?: { tts?: { voice?: string } } } & Record<string, unknown>;
    saveWorkflowConfigurations: (configs: { model_overrides?: { tts?: { voice?: string } } } & Record<string, unknown>, newName: string) => Promise<void>;
    onGoToAdvanced: () => void;
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
    onGoToAdvanced
}: SimpleWorkflowViewProps) {
    const [localName, setLocalName] = useState(workflowName);
    const [localObjective, setLocalObjective] = useState('');
    const [localVoice, setLocalVoice] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Find the start node to bind the objective/prompt
    const startNode = nodes.find(n => n.type === 'startCall' || n.type === 'agentNode');

    useEffect(() => {
        setLocalName(workflowName);

        if (startNode && startNode.data && typeof startNode.data.prompt === 'string') {
            setLocalObjective(startNode.data.prompt);
        }

        const voice = workflowConfigurations?.model_overrides?.tts?.voice || 'alloy';
        setLocalVoice(voice);
    }, [workflowName, startNode, workflowConfigurations]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save Name
            if (localName !== workflowName) {
                await renameWorkflow(localName);
            }

            // Save Objective (Prompt)
            if (startNode) {
                const updatedNodes = nodes.map(node => {
                    if (node.id === startNode.id) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                prompt: localObjective
                            }
                        };
                    }
                    return node;
                });
                setNodes(updatedNodes);
                setIsDirty(true);
                await saveWorkflow(true);
            }

            // Save Voice
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
                };
                await saveWorkflowConfigurations(updatedConfigs, localName);
            }

            toast.success("Agent settings saved successfully!");
        } catch (error) {
            toast.error("Failed to save agent settings");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-full p-8 bg-zinc-50 dark:bg-zinc-950 overflow-y-auto">
            <div className="w-full max-w-3xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Agent Builder</h1>
                        <p className="text-muted-foreground mt-1">Configure your AI assistant&apos;s basic behavior</p>
                    </div>
                    <Button variant="outline" onClick={onGoToAdvanced}>
                        Go to Advanced Builder
                    </Button>
                </div>

                <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="bg-zinc-100/50 dark:bg-zinc-900/50 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-primary" />
                            Agent Identity
                        </CardTitle>
                        <CardDescription>Give your agent a name and a voice.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Label htmlFor="agent-name" className="text-base font-semibold">Agent Name</Label>
                            <Input
                                id="agent-name"
                                value={localName}
                                onChange={(e) => setLocalName(e.target.value)}
                                className="max-w-md bg-white dark:bg-zinc-950"
                                placeholder="e.g. Customer Support Agent"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="agent-voice" className="text-base font-semibold">Voice Profile</Label>
                            <Select value={localVoice} onValueChange={setLocalVoice}>
                                <SelectTrigger className="max-w-md bg-white dark:bg-zinc-950" id="agent-voice">
                                    <SelectValue placeholder="Select a voice" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="alloy">Alloy (Neutral, Professional)</SelectItem>
                                    <SelectItem value="echo">Echo (Warm, Friendly)</SelectItem>
                                    <SelectItem value="fable">Fable (Expressive, British)</SelectItem>
                                    <SelectItem value="onyx">Onyx (Deep, Authoritative)</SelectItem>
                                    <SelectItem value="nova">Nova (Energetic, Female)</SelectItem>
                                    <SelectItem value="shimmer">Shimmer (Clear, Female)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">The voice your agent will use on calls.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="bg-zinc-100/50 dark:bg-zinc-900/50 border-b">
                        <CardTitle>Main Objective</CardTitle>
                        <CardDescription>Tell the AI exactly what its job is, how to behave, and what to say.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <Textarea
                                value={localObjective}
                                onChange={(e) => setLocalObjective(e.target.value)}
                                className="min-h-[250px] font-mono text-sm bg-white dark:bg-zinc-950 leading-relaxed"
                                placeholder="You are a helpful customer support agent for..."
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={isSaving} size="lg" className="px-8 shadow-md">
                        {isSaving ? "Saving..." : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Agent
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
