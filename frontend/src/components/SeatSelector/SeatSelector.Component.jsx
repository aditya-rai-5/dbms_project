import React from "react";

const seatBaseClass = "w-8 h-8 md:w-9 md:h-9 text-xs rounded-t-lg flex items-center justify-center font-semibold transition-all cursor-pointer select-none border border-gray-300";

const seatTypeColors = {
  AVAILABLE: {
    STANDARD: "bg-gray-100 hover:bg-blue-400 hover:text-white hover:border-blue-500",
    PREMIUM: "bg-purple-100 hover:bg-purple-500 hover:text-white hover:border-purple-500",
    VIP: "bg-yellow-100 hover:bg-yellow-500 hover:text-white hover:border-yellow-500",
  },
  SELECTED: "bg-blue-600 text-white border-blue-700",
  BOOKED: "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50 border-gray-400",
  LOCKED: "bg-orange-400 text-white cursor-not-allowed opacity-70 border-orange-500",
};

const SeatSelector = ({ seatsByRow, selectedSeats, onToggleSeat }) => {
  const selectedIds = new Set(selectedSeats.map(s => s.id));
  const rows = Object.keys(seatsByRow).sort();

  if (rows.length === 0) {
    return <div className="text-center py-12 text-gray-500">No seat data available.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {rows.map(row => (
          <div key={row} className="flex items-center gap-1 md:gap-2 mb-2 justify-center">
            <span className="w-6 text-center text-gray-500 text-sm font-mono font-bold flex-shrink-0">{row}</span>
            <div className="flex gap-1 flex-wrap justify-center">
              {seatsByRow[row].map(seat => {
                const isSelected = selectedIds.has(seat.id);
                let className = seatBaseClass + " ";

                if (seat.status === 'BOOKED') {
                  className += seatTypeColors.BOOKED;
                } else if (seat.status === 'LOCKED') {
                  className += seatTypeColors.LOCKED;
                } else if (isSelected) {
                  className += seatTypeColors.SELECTED;
                } else {
                  className += seatTypeColors.AVAILABLE[seat.type] || seatTypeColors.AVAILABLE.STANDARD;
                }

                return (
                  <button
                    key={seat.id}
                    className={className}
                    onClick={() => onToggleSeat(seat)}
                    disabled={seat.status === 'BOOKED' || seat.status === 'LOCKED'}
                    title={`${row}${seat.number} - ${seat.type} - ₹${seat.price}`}
                  >
                    {seat.number}
                  </button>
                );
              })}
            </div>
            <span className="w-6 text-center text-gray-500 text-sm font-mono font-bold flex-shrink-0">{row}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatSelector;
