export default function InfoNote({ children, variant = "info" }) {
  const styles = {
    info: "bg-[#F2FFFC] text-[#2F3E46] border-[#B7F0E6]",
    warn: "bg-[#FFF9E6] text-[#2F3E46] border-[#FFE3A3]",
  }[variant] || "bg-[#F2FFFC] text-[#2F3E46] border-[#B7F0E6]";

  return (
    <div className={`mt-3 rounded-xl border px-3 py-2 text-sm ${styles}`}>
      {children}
    </div>
  );
}

