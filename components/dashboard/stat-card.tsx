type StatCardProps = {
  title: string;
  value: string;
};

export function StatCard({
  title,
  value,
}: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <p className="text-sm text-muted-foreground">
        {title}
      </p>

      <h3 className="mt-2 text-3xl font-bold">
        {value}
      </h3>
    </div>
  );
}