import React from "react";
import { format } from "date-fns";
import { Quote } from "lucide-react";
import type { Tribute } from "@workspace/api-client-react/src/generated/api.schemas";
import { Card } from "@/components/ui/card";

interface TributeCardProps {
  tribute: Tribute;
  className?: string;
}

export function TributeCard({ tribute, className = "" }: TributeCardProps) {
  return (
    <Card className={`relative overflow-hidden p-8 border border-border bg-card rounded-none shadow-sm transition-shadow duration-500 ${className}`}>
      <div className="absolute top-6 left-6 text-primary/10">
        <Quote size={48} className="rotate-180" />
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        <p className="text-lg text-foreground font-serif leading-relaxed italic mb-8 grow whitespace-pre-wrap">
          "{tribute.message}"
        </p>
        
        <div className="mt-auto pt-6 border-t border-border flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h4 className="font-serif text-primary text-xl">
              {tribute.authorName}
            </h4>
            <p className="text-sm text-muted-foreground tracking-widest uppercase mt-1">
              {tribute.relationship}
            </p>
          </div>
          <span className="text-xs text-muted-foreground uppercase tracking-widest whitespace-nowrap">
            {format(new Date(tribute.createdAt), "MMM d, yyyy")}
          </span>
        </div>
      </div>
    </Card>
  );
}
