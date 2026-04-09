import React from "react";

interface Feature {
  title: string;
  body: string;
}

const defaultFeatures: Feature[] = [
  { title: "Technical Summaries", body: "Extracts the skills and responsibilities from job descriptions." },
  { title: "Match Messages", body: "Generates outreach messages tailored to the job and tone." },
  { title: "Exportable", body: "Copy-ready messages and skill matrices for recruiters." }
];

export default function FeatureList({ features = defaultFeatures }: { features?: Feature[] }) {
  return (
    <section className="py-16 bg-slate-950 text-slate-100">
      <div className="container mx-auto px-6 md:px-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="p-6 bg-slate-900 rounded-lg border border-slate-800">
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-slate-400 text-sm">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
