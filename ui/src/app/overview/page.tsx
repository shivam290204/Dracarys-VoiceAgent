"use client";

import { Bot, ExternalLink, Flame, Loader2, Mic, Phone, PhoneCall, PhoneOff, Workflow } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { getWorkflowsApiV1WorkflowFetchGet, initiateCallApiV1TelephonyInitiateCallPost } from '@/client/sdk.gen';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function OverviewPage() {
    const [showCallDialog, setShowCallDialog] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isCallInitiated, setIsCallInitiated] = useState(false);
    const [isCalling, setIsCalling] = useState(false);

    const handleInitiateCall = async () => {
        if (!phoneNumber.trim()) return;
        setIsCalling(true);
        try {
            // Fetch workflows to find an active agent to place the call
            const response = await getWorkflowsApiV1WorkflowFetchGet({
                query: { status: 'active' }
            });
            const workflows = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
            if (workflows.length === 0) {
                toast.error("You need to build a Voice Agent first!");
                setIsCalling(false);
                return;
            }
            
            // Just use the first active workflow for the demo call
            const workflowId = workflows[0].id;
            
            await initiateCallApiV1TelephonyInitiateCallPost({
                body: {
                    workflow_id: workflowId,
                    phone_number: phoneNumber,
                }
            });
            
            setIsCallInitiated(true);
        } catch (err: any) {
            console.error("Call initiation error", err);
            toast.error(err?.response?.data?.detail || "Failed to initiate call. Check if you have a valid telephony configuration.");
        } finally {
            setIsCalling(false);
        }
    };

    const handleCloseDialog = () => {
        setShowCallDialog(false);
        setIsCallInitiated(false);
        setPhoneNumber('');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto">

                {/* Welcome Hero */}
                <div className="mb-10 flex flex-col items-start gap-2">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15">
                            <Flame className="h-5 w-5 text-orange-500" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Welcome to Dracarys</h1>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Your AI-powered voice agent platform. Build, deploy, and scale conversations effortlessly.
                    </p>
                </div>

                {/* Call AI Agent Hero Feature */}
                <Card className="mb-8 border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20">
                                <PhoneCall className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Try Dracarys Live</CardTitle>
                                <CardDescription className="text-sm mt-0.5">
                                    Enter your phone number and let our AI agent call you — experience it firsthand!
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                            <div className="flex-1">
                                <Input
                                    id="phone-input"
                                    type="tel"
                                    placeholder="+91 98765 43210"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="border-orange-500/30 focus-visible:ring-orange-500/50"
                                />
                            </div>
                            <Button
                                id="call-agent-btn"
                                onClick={() => {
                                    if (phoneNumber.trim()) {
                                        setShowCallDialog(true);
                                    }
                                }}
                                className="bg-orange-500 text-white hover:bg-orange-600 gap-2 shrink-0"
                            >
                                <Phone className="h-4 w-4" />
                                Call Me Now
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Make sure you have a Telephony configuration set up with an active phone number.
                        </p>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                    <Card className="group hover:border-primary/40 transition-colors cursor-pointer">
                        <Link href="/workflow">
                            <CardHeader>
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 mb-2 group-hover:bg-primary/20 transition-colors">
                                    <Workflow className="h-4 w-4 text-primary" />
                                </div>
                                <CardTitle className="text-base">Build a Voice Agent</CardTitle>
                                <CardDescription className="text-sm">
                                    Design your AI agent with our visual flow builder.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <span className="text-sm font-medium text-primary flex items-center gap-1">
                                    Go to Voice Agents <ExternalLink className="h-3 w-3" />
                                </span>
                            </CardContent>
                        </Link>
                    </Card>

                    <Card className="group hover:border-primary/40 transition-colors cursor-pointer">
                        <Link href="/telephony-configurations">
                            <CardHeader>
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 mb-2 group-hover:bg-blue-500/20 transition-colors">
                                    <Phone className="h-4 w-4 text-blue-500" />
                                </div>
                                <CardTitle className="text-base">Set Up Telephony</CardTitle>
                                <CardDescription className="text-sm">
                                    Connect Twilio, Telnyx, or Cloudonix to give your agent a real phone number.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <span className="text-sm font-medium text-blue-500 flex items-center gap-1">
                                    Configure Telephony <ExternalLink className="h-3 w-3" />
                                </span>
                            </CardContent>
                        </Link>
                    </Card>

                    <Card className="group hover:border-primary/40 transition-colors cursor-pointer">
                        <Link href="/model-configurations">
                            <CardHeader>
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 mb-2 group-hover:bg-purple-500/20 transition-colors">
                                    <Bot className="h-4 w-4 text-purple-500" />
                                </div>
                                <CardTitle className="text-base">Configure AI Models</CardTitle>
                                <CardDescription className="text-sm">
                                    Choose your LLM, speech-to-text, and text-to-speech providers.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <span className="text-sm font-medium text-purple-500 flex items-center gap-1">
                                    Configure Models <ExternalLink className="h-3 w-3" />
                                </span>
                            </CardContent>
                        </Link>
                    </Card>
                </div>

                {/* How It Works */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">How Dracarys Works</CardTitle>
                        <CardDescription>Get up and running in 3 simple steps</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="flex flex-col gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/15 text-orange-500 font-bold text-sm">1</div>
                                <h3 className="font-semibold text-sm">Design Your Agent</h3>
                                <p className="text-xs text-muted-foreground">
                                    Use the visual workflow builder to define how your AI agent talks and responds.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/15 text-orange-500 font-bold text-sm">2</div>
                                <h3 className="font-semibold text-sm">Connect a Phone Number</h3>
                                <p className="text-xs text-muted-foreground">
                                    Link your Twilio, Telnyx, or Cloudonix account and assign a number to your agent.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/15 text-orange-500 font-bold text-sm">3</div>
                                <h3 className="font-semibold text-sm">Go Live</h3>
                                <p className="text-xs text-muted-foreground">
                                    Your agent is ready! Anyone who calls your number will be greeted by Dracarys AI instantly.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Call Dialog */}
            <Dialog open={showCallDialog} onOpenChange={handleCloseDialog}>
                <DialogContent id="call-dialog" className="sm:max-w-md">
                    {!isCallInitiated ? (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20">
                                        <PhoneCall className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <DialogTitle>Calling {phoneNumber}</DialogTitle>
                                </div>
                                <DialogDescription>
                                    Our AI agent will call this number shortly. Make sure your phone is nearby!
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col gap-3 mt-2">
                                <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                                    <Label className="font-medium text-foreground">Phone Number</Label>
                                    <p className="mt-1 font-mono">{phoneNumber}</p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    This requires a Telephony configuration with an active outbound phone number. Set one up in{' '}
                                    <Link href="/telephony-configurations" className="underline" onClick={handleCloseDialog}>
                                        Telephony Settings
                                    </Link>.
                                </p>
                                <div className="flex gap-2 justify-end mt-1">
                                    <Button id="cancel-call-btn" variant="outline" onClick={handleCloseDialog}>
                                        Cancel
                                    </Button>
                                    <Button
                                        id="confirm-call-btn"
                                        className="bg-orange-500 hover:bg-orange-600 gap-2"
                                        onClick={handleInitiateCall}
                                        disabled={isCalling}
                                    >
                                        {isCalling ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Initiating...
                                            </>
                                        ) : (
                                            <>
                                                <Phone className="h-4 w-4" />
                                                Confirm Call
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 animate-pulse">
                                        <Mic className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <DialogTitle>Agent is calling you!</DialogTitle>
                                </div>
                                <DialogDescription>
                                    Your AI agent is dialing <span className="font-mono font-medium text-foreground">{phoneNumber}</span>. Pick up the call!
                                </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4 flex flex-col items-center gap-4 py-2">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 animate-pulse">
                                    <PhoneCall className="h-8 w-8 text-emerald-500" />
                                </div>
                                <p className="text-sm text-muted-foreground text-center">Calling {phoneNumber}...</p>
                                <Button
                                    id="end-call-btn"
                                    variant="destructive"
                                    className="gap-2"
                                    onClick={handleCloseDialog}
                                >
                                    <PhoneOff className="h-4 w-4" />
                                    End / Dismiss
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
