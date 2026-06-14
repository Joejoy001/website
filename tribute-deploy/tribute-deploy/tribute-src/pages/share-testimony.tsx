import React from "react";
import { NavBar } from "./home";
import { TributeForm } from "@/components/TributeForm";

export default function ShareTestimony() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="max-w-4xl mx-auto px-6 py-16">
        <TributeForm />
      </div>
      <footer className="text-center py-12 text-muted-foreground text-sm border-t border-border mx-6">
        <p>Celebrating 60 years of grace · Pastor Joseph Olusola Samuel</p>
      </footer>
    </div>
  );
}
