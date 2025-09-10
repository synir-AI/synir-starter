"use client";  

export default function ToolCard({ title, description, action, onClick, subtle }) {
  return (
    <div className="card hover:shadow-glow transition">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-softgray/80">{description}</p>
      <button
        onClick={onClick}
        className={`mt-4 ${subtle ? "underline underline-offset-4" : "button-primary"}`}
      >
        {action}
      </button>
    </div>
  );
}
