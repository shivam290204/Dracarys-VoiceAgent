import React from 'react';

interface SimpleWorkflowViewProps {
    workflowName: string;
    onGoToAdvanced: () => void;
    testerPanel: React.ReactNode;
}

export function SimpleWorkflowView({
    testerPanel
}: SimpleWorkflowViewProps) {
    return (
        <div className="flex w-full h-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden relative">
            {/* Main Content Area - Just Test Drive */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-10 items-center pt-24">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">Test Drive</h1>
                    <p className="text-lg text-muted-foreground">Talk to your agent right now before deploying.</p>
                </div>
                <div className="w-full max-w-3xl h-[600px] border rounded-2xl shadow-sm bg-white dark:bg-zinc-900 overflow-hidden relative">
                    {testerPanel}
                </div>
            </div>
        </div>
    );
}
