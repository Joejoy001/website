import React from "react";
import { Link } from "wouter";
import { BookOpen } from "lucide-react";
import { useListTributes } from "@workspace/api-client-react";

import { TributeCard } from "@/components/TributeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { NavBar } from "@/pages/home";

export default function Tributes() {
  const { data: tributes, isLoading } = useListTributes();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar />

      <main className="max-w-6xl mx-auto px-6 py-16 flex-1 w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-6">
            A Lifetime of <span className="italic text-primary">Memories</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Scroll through the beautiful words, stories, and well wishes left by family, friends, and colleagues.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : !tributes || tributes.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-border bg-card/50">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/5 text-primary/40 mb-6">
              <BookOpen size={40} />
            </div>
            <h2 className="font-serif text-3xl text-foreground mb-4">No tributes yet</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              The pages are empty, waiting to be filled with stories and love.
            </p>
            <Link href="/#guestbook" className="inline-flex items-center justify-center rounded-none bg-primary text-primary-foreground px-8 py-4 text-sm uppercase tracking-widest font-medium hover:bg-primary/90 transition-colors shadow-sm">
              Be the First to Write
            </Link>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {tributes.map((tribute, i) => (
              <div 
                key={tribute.id} 
                className="break-inside-avoid"
              >
                <TributeCard tribute={tribute} />
              </div>
            ))}
          </div>
        )}
      </main>
      
      <footer className="text-center py-12 text-muted-foreground text-sm border-t border-border mx-6">
        <p>Celebrating 60 years of grace · Pastor Joseph Olusola Samuel</p>
      </footer>
    </div>
  );
}
