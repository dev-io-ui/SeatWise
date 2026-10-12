import Card from "../ui/Card.jsx";

const buildHallGroups = (allocations) => {
  const groups = allocations.reduce((accumulator, allocation) => {
    const hall = allocation.hallId;
    const hallKey = hall?._id || allocation.hallId;

    if (!accumulator[hallKey]) {
      accumulator[hallKey] = {
        hallId: hallKey,
        hallName: hall?.hallName || "Hall",
        capacity: hall?.capacity || 0,
        rows: hall?.rows || 5,
        columns: hall?.columns || 6,
        seats: [],
      };
    }

    accumulator[hallKey].rows = Math.max(accumulator[hallKey].rows, allocation.row || 1);
    accumulator[hallKey].columns = Math.max(accumulator[hallKey].columns, allocation.column || 1);
    accumulator[hallKey].seats.push(allocation);
    return accumulator;
  }, {});

  return Object.values(groups).sort((left, right) => left.hallName.localeCompare(right.hallName));
};

export default function PrintableLayout({ exam, allocations }) {
  const hallGroups = buildHallGroups(allocations);

  return (
    <div className="space-y-6">
      {hallGroups.length ? (
        hallGroups.map((hall) => {
          const cellCount = hall.rows * hall.columns;

          return (
            <Card
              key={hall.hallId}
              title={hall.hallName}
              subtitle={`${exam?.examName || "Exam"} | Capacity ${hall.capacity} | ${hall.seats.length} seats assigned`}
              className="bg-gradient-to-br from-white to-accentSoft/25"
            >
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: `repeat(${hall.columns}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: cellCount }).map((_, index) => {
                  const seat = hall.seats.find((item) => item.seatNumber === index + 1);

                  return (
                    <div
                      key={`${hall.hallId}-${index + 1}`}
                      className="min-h-28 rounded-3xl border border-line bg-white/85 p-3"
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        {seat?.seatLabel || `Seat ${index + 1}`}
                      </p>
                      <p className="mt-3 text-sm font-semibold text-ink">{seat?.studentId?.name || "Empty"}</p>
                      <p className="mt-1 text-xs text-muted">{seat?.studentId?.rollNumber || "-"}</p>
                      <p className="mt-3 text-xs font-medium text-[#A24E00]">{seat?.department || "Vacant"}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })
      ) : (
        <Card title="Printable Layout" subtitle="Generate an allocation to unlock the hall-wise seating layout.">
          <p className="text-sm text-muted">No hall layout is available yet for the selected exam.</p>
        </Card>
      )}
    </div>
  );
}

