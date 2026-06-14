import React, { useState } from "react";
import { Link } from "wouter";
import { MapPin, User, Phone, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";

import { useCreateRsvp, useGetRsvpStats, getGetRsvpStatsQueryKey } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { NavBar } from "@/pages/home";

const attendanceOptions = [
  "Yes, I will attend in person",
  "I will attend virtually",
  "No, I will not be able to attend"
] as const;

const formSchema = z.object({
  fullName: z.string().min(1, "Please enter your full name").max(100),
  phone: z.string().min(5, "Please enter a valid phone number").max(20),
  attendance: z.enum(attendanceOptions, {
    required_error: "Please select your attendance status",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Rsvp() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createRsvp = useCreateRsvp();
  const { data: stats } = useGetRsvpStats();
  const [submitted, setSubmitted] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      attendance: undefined,
    },
  });

  const onSubmit = (data: FormValues) => {
    createRsvp.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetRsvpStatsQueryKey() });
          setSubmitted(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Something went wrong",
            description: "Could not submit your RSVP. Please try again.",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar />
      
      <main className="flex-1 flex flex-col items-center justify-center py-16 px-6 relative">
        {submitted ? (
          <div className="max-w-lg w-full bg-card border border-border p-12 text-center animate-in zoom-in-95 duration-500">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 text-green-500 mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-serif text-foreground mb-4">Thank You!</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Your RSVP has been successfully received. We look forward to celebrating together.
            </p>
            
            {stats && (
              <div className="bg-background border border-border p-6 mb-8 text-left space-y-4">
                <h3 className="font-serif text-lg text-foreground border-b border-border pb-2">Current Responses</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">In Person</span>
                  <span className="font-medium text-foreground">{stats.inPerson}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Virtual</span>
                  <span className="font-medium text-foreground">{stats.virtual}</span>
                </div>
              </div>
            )}
            
            <Button asChild size="lg" className="rounded-none px-8 py-6 text-sm uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        ) : (
          <div className="max-w-2xl w-full">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">RSVP for the Celebration</h1>
              <p className="text-lg text-primary font-serif italic mb-8">
                Thanksgiving Celebration · Saturday, 29th August, 2026 at 10:00 a.m.
              </p>
              
              <div className="inline-flex items-center gap-4 bg-card border border-border px-6 py-4">
                <MapPin className="text-primary" size={24} />
                <div className="text-left">
                  <p className="font-medium text-foreground">Lagelu Grammar School</p>
                  <p className="text-sm text-muted-foreground">Agugu, Ibadan</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border p-8 md:p-10">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground uppercase tracking-widest text-xs flex items-center gap-2">
                            <User size={14} /> Full Name
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" className="bg-background border-border focus:border-primary focus:ring-primary/20 transition-colors rounded-none h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground uppercase tracking-widest text-xs flex items-center gap-2">
                            <Phone size={14} /> Telephone Number
                          </FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+234..." className="bg-background border-border focus:border-primary focus:ring-primary/20 transition-colors rounded-none h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="attendance"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-foreground uppercase tracking-widest text-xs">Will you be attending?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-3"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0 border border-border p-4 bg-background cursor-pointer hover:border-primary/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                              <FormControl>
                                <RadioGroupItem value="Yes, I will attend in person" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer w-full text-base">
                                Yes, I will attend in person
                              </FormLabel>
                            </FormItem>
                            
                            <FormItem className="flex items-start space-x-3 space-y-0 border border-border p-4 bg-background cursor-pointer hover:border-primary/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                              <FormControl className="mt-1">
                                <RadioGroupItem value="I will attend virtually" />
                              </FormControl>
                              <div className="flex flex-col">
                                <FormLabel className="font-normal cursor-pointer text-base">
                                  I will attend virtually
                                </FormLabel>
                                <span className="text-sm text-muted-foreground mt-1">I will use the online details when shared</span>
                              </div>
                            </FormItem>
                            
                            <FormItem className="flex items-center space-x-3 space-y-0 border border-border p-4 bg-background cursor-pointer hover:border-primary/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                              <FormControl>
                                <RadioGroupItem value="No, I will not be able to attend" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer w-full text-base">
                                No, I will not be able to attend
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={createRsvp.isPending}
                      className="w-full rounded-none h-14 text-sm uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                    >
                      {createRsvp.isPending ? "Submitting..." : "Submit RSVP"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        )}
      </main>
      
      <footer className="text-center py-12 text-muted-foreground text-sm border-t border-border mx-6">
        <p>Celebrating 60 years of grace · Pastor Joseph Olusola Samuel</p>
      </footer>
    </div>
  );
}
