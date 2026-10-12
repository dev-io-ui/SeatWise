import Card from "../ui/Card.jsx";

export default function HallCapacityCard({ hallUtilization = [] }) {
  return (
    <Card
      title="Hall Capacity Snapshot"
      subtitle="Live hall occupancy from the latest generated allocation."
      className="h-full"
    >
      <div className="space-y-4">
        {hallUtilization.length ? (
          hallUtilization.map((hall) => {
            const percent = hall.capacity ? Math.round((hall.occupied / hall.capacity) * 100) : 0;
            return (
              <div key={hall.hallId} className="rounded-3xl bg-shell/70 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{hall.hallName}</p>
                    <p className="text-sm text-muted">
                      {hall.occupied} / {hall.capacity} occupied
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-primary">{percent}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="rounded-3xl bg-shell/70 p-5 text-sm text-muted">
            No hall utilization data yet. Generate seating for an exam to populate this chart.
          </p>
        )}
      </div>
    </Card>
  );
}

