import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Heart, Calendar, MapPin, Clock, Copy, CheckCircle2 } from "lucide-react";
import { useGetTributeStats } from "@workspace/api-client-react";

import { TributeCard } from "@/components/TributeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function NavBar() {
  const [location] = useLocation();
  
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 h-20 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 pt-4 md:pt-0">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary flex items-center justify-center text-primary-foreground font-serif text-xl font-bold rounded-sm shadow-sm group-hover:bg-primary/90 transition-colors">
            60
          </div>
          <span className="font-serif text-lg font-medium tracking-wide text-foreground">
            PastorSamuel@60
          </span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto">
          <Link href="/" className={`px-4 py-2 text-sm font-medium uppercase tracking-widest rounded-md transition-colors whitespace-nowrap ${location === '/' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}>Home</Link>
          <Link href="/tributes" className={`px-4 py-2 text-sm font-medium uppercase tracking-widest rounded-md transition-colors whitespace-nowrap ${location === '/tributes' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}>Testimonies</Link>
          <Link href="/share-testimony" className={`px-4 py-2 text-sm font-medium uppercase tracking-widest rounded-md transition-colors whitespace-nowrap ${location === '/share-testimony' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}>Share Testimony</Link>
          <Link href="/rsvp" className={`px-4 py-2 text-sm font-medium uppercase tracking-widest rounded-md transition-colors whitespace-nowrap ${location === '/rsvp' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}>RSVP</Link>
        </nav>
      </div>
    </header>
  );
}

export default function Home() {
  const { data: stats, isLoading } = useGetTributeStats();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const TARGET = new Date("2026-08-29T10:00:00").getTime();

  function calcTimeLeft() {
    const distance = TARGET - Date.now();
    if (distance <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
    };
  }

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText("6017362846");
    setCopied(true);
    toast({ title: "Account number copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero Section */}
      <section className="relative min-h-[90dvh] flex flex-col justify-center items-center px-6 py-12 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          <div className="flex flex-col items-center gap-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-background/50 backdrop-blur-sm text-sm font-medium text-primary uppercase tracking-widest shadow-sm">
              <Heart size={14} className="fill-primary" />
              <span>Celebrating 60th Birthday and Retirement of an Icon</span>
            </div>
            
            <h2 className="text-sm md:text-base font-medium uppercase tracking-[0.3em] text-muted-foreground">
              A THANKSGIVING CELEBRATION FOR
            </h2>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-foreground leading-[1.1]">
              Pastor Joseph Olusola Samuel
            </h1>
            
            <p className="text-lg md:text-xl text-primary font-serif italic max-w-2xl mx-auto">
              Turning 60 & Celebrating a Legacy
            </p>
          </div>

          <div className="pt-8 flex justify-center gap-4">
            <div className="flex flex-col items-center bg-black/20 border border-border rounded-xl p-4 min-w-[80px] md:min-w-[100px]">
              <span className="font-serif text-4xl text-primary mb-1">{String(timeLeft.days).padStart(2, '0')}</span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Days</span>
            </div>
            <div className="flex flex-col items-center bg-black/20 border border-border rounded-xl p-4 min-w-[80px] md:min-w-[100px]">
              <span className="font-serif text-4xl text-primary mb-1">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Hours</span>
            </div>
            <div className="flex flex-col items-center bg-black/20 border border-border rounded-xl p-4 min-w-[80px] md:min-w-[100px]">
              <span className="font-serif text-4xl text-primary mb-1">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Minutes</span>
            </div>
            <div className="flex flex-col items-center bg-black/20 border border-border rounded-xl p-4 min-w-[80px] md:min-w-[100px]">
              <span className="font-serif text-4xl text-primary mb-1">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Seconds</span>
            </div>
          </div>

          <div className="pt-12 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
            <Button asChild size="lg" className="rounded-none px-8 py-6 text-sm uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/rsvp">RSVP Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-none px-8 py-6 text-sm uppercase tracking-widest border-primary text-primary hover:bg-primary/10">
              <a href="#support">Send Your Support</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-none px-8 py-6 text-sm uppercase tracking-widest border-primary text-primary hover:bg-primary/10">
              <Link href="/share-testimony">Share Testimony</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-none px-8 py-6 text-sm uppercase tracking-widest border-primary text-primary hover:bg-primary/10">
              <Link href="/tributes">Read Testimonies</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="bg-[#FCFAF7] text-slate-900 border-t border-border/10">
        {/* Event Details Section */}
        <section className="py-24 px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#8B2332] mb-3">Mark Your Calendar</p>
              <h2 className="text-4xl md:text-5xl font-serif mb-4 text-slate-900">Celebration Details</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto italic font-serif">
                Join us as we gather to celebrate the life, grace, and impact of Pastor Joseph Olusola Samuel.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white border border-slate-200 p-8 text-center shadow-sm">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#8B2332]/10 text-[#8B2332] mb-6">
                  <Calendar size={24} />
                </div>
                <h3 className="font-serif text-2xl mb-2 text-slate-900">The Birthday & Retirement</h3>
                <p className="text-[#8B2332] font-medium mb-3">Tuesday, 25th August, 2026</p>
                <p className="text-slate-600 text-sm">Pastor Joseph Olusola Samuel's 60th Birthday & Retirement</p>
              </div>

              <div className="bg-white border border-slate-200 p-8 text-center shadow-sm">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#8B2332]/10 text-[#8B2332] mb-6">
                  <Clock size={24} />
                </div>
                <h3 className="font-serif text-2xl mb-2 text-slate-900">Thanksgiving Service</h3>
                <p className="text-[#8B2332] font-medium mb-3">Saturday, 29th August, 2026</p>
                <p className="text-slate-600 text-sm">10:00 a.m.</p>
              </div>

              <div className="bg-white border border-slate-200 p-8 text-center shadow-sm">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#8B2332]/10 text-[#8B2332] mb-6">
                  <MapPin size={24} />
                </div>
                <h3 className="font-serif text-2xl mb-2 text-slate-900">Venue</h3>
                <p className="text-[#8B2332] font-medium mb-3">Lagelu Grammar School</p>
                <p className="text-slate-600 text-sm">Agugu, Ibadan</p>
              </div>
            </div>
          </div>
        </section>

        {/* Send Your Support Section */}
        <section id="support" className="py-24 px-6 relative bg-slate-50 border-t border-slate-200">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#8B2332] mb-3">In Lieu of Physical Gifts</p>
            <h2 className="text-4xl font-serif mb-4 text-slate-900">Send Your Support</h2>
            <p className="text-lg text-slate-600">
              Please note that <strong className="font-semibold text-slate-900">no physical gifts, souvenirs, or other ceremonial activities</strong> shall be entertained. Any plans for such can be monetized and sent to the account below.
            </p>
          </div>

          <div className="max-w-xl mx-auto bg-white border border-slate-200 border-l-4 border-l-[#C9973A] p-8 shadow-sm">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-500 text-sm uppercase tracking-wider mb-1 sm:mb-0">Bank</span>
                <span className="font-medium text-slate-900">Fidelity Bank</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-500 text-sm uppercase tracking-wider mb-1 sm:mb-0">Account Number</span>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-900 text-lg">6017362846</span>
                  <button 
                    onClick={handleCopy}
                    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                    title="Copy account number"
                  >
                    {copied ? <CheckCircle2 size={16} className="text-green-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3">
                <span className="text-slate-500 text-sm uppercase tracking-wider mb-1 sm:mb-0">Account Name</span>
                <span className="font-medium text-slate-900">Joseph Samuel Olusola</span>
              </div>
            </div>
          </div>
        </section>

        {/* Testimony Deadline Section */}
        <section className="py-20 px-6 relative border-t border-slate-200 text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 mb-4">Testimony Submission Deadline</p>
            <h3 className="text-4xl md:text-5xl font-serif text-[#8B2332] mb-6">15th August, 2026</h3>
            <p className="text-lg text-slate-600 mb-8">
              Please submit your testimony before this date to be included in the publication.
            </p>
            <Button asChild size="lg" className="rounded-none px-8 py-6 text-sm uppercase tracking-widest bg-[#8B2332] text-white hover:bg-[#8B2332]/90">
              <Link href="/share-testimony">Write Your Testimony</Link>
            </Button>
          </div>
        </section>
      </div>

      {/* Recent Tributes Preview */}
      <section className="py-20 px-6 border-t border-border bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">Words of Love</h2>
            <div className="text-primary font-serif italic flex items-center justify-center gap-2">
              <Heart size={16} className="fill-primary" />
              {isLoading ? (
                <Skeleton className="h-5 w-48" />
              ) : (
                <span>{stats?.totalCount || 0} testimonies shared</span>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Skeleton className="h-64 rounded-none bg-card" />
              <Skeleton className="h-64 rounded-none bg-card" />
              <Skeleton className="h-64 rounded-none bg-card" />
            </div>
          ) : !stats || stats.recentTributes.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border bg-card/50">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                <Heart size={32} />
              </div>
              <h3 className="font-serif text-2xl text-foreground mb-2">Be the first to share</h3>
              <p className="text-muted-foreground">The guestbook is waiting for its first entry.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.recentTributes.slice(0, 3).map((tribute, i) => (
                <TributeCard 
                  key={tribute.id} 
                  tribute={tribute} 
                  className={`animate-in fade-in slide-in-from-bottom-8 duration-700 delay-${i * 150}`}
                />
              ))}
            </div>
          )}
          
          <div className="mt-16 text-center">
            <Button asChild variant="outline" className="rounded-none px-8 py-6 text-sm uppercase tracking-widest border-primary text-primary hover:bg-primary/10">
              <Link href="/tributes">Read All Testimonies</Link>
            </Button>
          </div>
        </div>
      </section>
      
      <footer className="text-center py-12 text-muted-foreground text-sm border-t border-border mx-6">
        <p>Celebrating 60 years of grace · Pastor Joseph Olusola Samuel</p>
      </footer>
    </div>
  );
}
