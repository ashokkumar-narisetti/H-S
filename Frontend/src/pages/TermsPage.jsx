export default function TermsPage() {
  return (
    <div className="pt-32 pb-20 max-w-3xl mx-auto px-4 min-h-screen">
      <h1 className="font-heading text-4xl uppercase font-bold mb-8 text-center">Terms & Conditions</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        <h3 className="font-bold uppercase tracking-widest text-foreground mt-8 mb-4">1. Introduction</h3>
        <p className="mb-6 leading-relaxed">Welcome to H&S Collective. By accessing our website, you agree to these terms. Please read them carefully.</p>
        
        <h3 className="font-bold uppercase tracking-widest text-foreground mt-8 mb-4">2. Purchases & Payment</h3>
        <p className="mb-6 leading-relaxed">All payments must be made in full before items are dispatched. We reserve the right to cancel any order for any reason.</p>

        <h3 className="font-bold uppercase tracking-widest text-foreground mt-8 mb-4">3. Intellectual Property</h3>
        <p className="mb-6 leading-relaxed">All designs, photography, and text on this site are the intellectual property of H&S Collective and may not be used without permission.</p>
      </div>
    </div>
  );
}
