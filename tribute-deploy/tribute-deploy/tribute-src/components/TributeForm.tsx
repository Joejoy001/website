import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { PenTool, Send, Info } from "lucide-react";

import { useCreateTribute, getListTributesQueryKey, getGetTributeStatsQueryKey } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  authorName: z.string().min(1, "Please tell us your name").max(100),
  relationship: z.string().min(1, "How do you know him?").max(100),
  message: z.string().min(5, "Please leave a longer message").max(2000, "Message is too long"),
  consent: z.boolean().refine(val => val === true, "You must agree to the publication consent"),
});

type FormValues = z.infer<typeof formSchema>;

export function TributeForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createTribute = useCreateTribute();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      authorName: "",
      relationship: "",
      message: "",
      consent: false,
    },
  });

  const onSubmit = (data: FormValues) => {
    // Drop consent field before sending to API
    const { consent, ...apiData } = data;
    createTribute.mutate(
      { data: apiData },
      {
        onSuccess: () => {
          form.reset();
          queryClient.invalidateQueries({ queryKey: getListTributesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTributeStatsQueryKey() });
          toast({
            title: "Thank you",
            description: "Your tribute has been added to the guestbook.",
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Something went wrong",
            description: "Could not save your tribute. Please try again.",
          });
        },
      }
    );
  };

  return (
    <div className="bg-card border border-border p-8 md:p-12 relative overflow-hidden">
      
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="mb-10 bg-primary/10 border border-primary/20 p-4 flex items-start gap-3">
          <Info className="text-primary mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-medium text-foreground text-sm uppercase tracking-wider mb-1">Submission Deadline: 15th August, 2026</p>
            <p className="text-sm text-muted-foreground">Please submit before this date to be included in the publication.</p>
          </div>
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 border border-primary text-primary mb-6">
            <PenTool size={20} />
          </div>
          <h3 className="font-serif text-3xl text-primary mb-3 uppercase tracking-widest">Share Your Tribute</h3>
          <p className="text-muted-foreground font-serif italic text-lg">
            Share a memory, a story, or simply your well wishes for Pastor Joseph Olusola Samuel. 
            Your words will mean the world.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="authorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground uppercase tracking-widest text-xs">Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" className="bg-background border-border focus:border-primary focus:ring-primary/20 transition-colors rounded-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground uppercase tracking-widest text-xs">Relationship to Pastor Joseph</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Son, Colleague, Friend" className="bg-background border-border focus:border-primary focus:ring-primary/20 transition-colors rounded-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground uppercase tracking-widest text-xs">Your Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write your tribute here..." 
                      className="min-h-[160px] resize-y bg-background border-border focus:border-primary focus:ring-primary/20 transition-colors text-base p-4 rounded-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-4 pb-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="rounded-none border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal text-muted-foreground cursor-pointer">
                      By submitting, you confirm that your testimony is suitable and may be published on the testimonies page.
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            <div className="pt-6 text-center">
              <Button 
                type="submit" 
                disabled={createTribute.isPending}
                className="rounded-none px-12 py-6 text-sm uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 w-full md:w-auto"
              >
                {createTribute.isPending ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="mr-3 h-4 w-4" />
                    Submit Tribute
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
