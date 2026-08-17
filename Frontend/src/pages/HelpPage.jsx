export default function HelpPage() {
  return (
    <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 min-h-screen">
      <h1 className="font-heading text-4xl uppercase font-bold mb-8 text-center">Help Center</h1>
      <div className="space-y-6">
        {[
          { q: "How do I return an item?", a: "We offer free returns within 30 days of purchase. Please visit our returns portal to generate a label." },
          { q: "Do you ship internationally?", a: "Yes, we ship globally. Shipping times and costs are calculated at checkout." },
          { q: "How do your clothes fit?", a: "Most of our items feature an oversized streetwear fit. Please refer to the specific size guide on each product page." }
        ].map((faq, i) => (
          <div key={i} className="border border-border p-6 bg-muted/20">
            <h3 className="font-bold uppercase tracking-widest text-sm mb-3">{faq.q}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <p className="text-sm uppercase tracking-widest mb-4">Still need help?</p>
        <button className="px-8 py-3 bg-foreground text-background font-bold uppercase tracking-widest text-sm hover:bg-black/80 transition-colors">
          Contact Support
        </button>
      </div>
    </div>
  );
}
