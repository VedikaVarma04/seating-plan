import { cn } from "@/lib/utils";
import { Seat } from "@/lib/mock-db";
import { User, CheckCircle2 } from "lucide-react";

interface SeatingGridProps {
  seats: Seat[];
  onSeatClick?: (seat: Seat) => void;
  readOnly?: boolean;
  highlightRollNo?: string;
}

export function SeatingGrid({ seats, onSeatClick, readOnly = false, highlightRollNo }: SeatingGridProps) {
  // Group seats by row for rendering
  const rows = Array.from({ length: 8 }, (_, i) => i);
  const cols = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[600px] mx-auto bg-card rounded-xl border p-8 shadow-sm">
        {/* Blackboard / Front of class indicator */}
        <div className="w-2/3 mx-auto h-2 bg-foreground/10 rounded-full mb-12 relative">
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
            Front of Class / Blackboard
          </span>
        </div>

        <div className="grid grid-rows-8 gap-4">
          {rows.map((row) => (
            <div key={`row-${row}`} className="flex justify-center gap-4 md:gap-6">
               {/* Row Label */}
               <div className="flex items-center justify-center w-6 text-xs text-muted-foreground font-mono">
                  R{row + 1}
               </div>
               
              {cols.map((col) => {
                const seat = seats.find((s) => s.row === row && s.col === col);
                const isOccupied = !!seat?.studentId;
                const isHighlighted = highlightRollNo && seat?.studentId === highlightRollNo;

                return (
                  <div key={`cell-${row}-${col}`} className="relative group">
                    <button
                      onClick={() => seat && !readOnly && onSeatClick?.(seat)}
                      disabled={readOnly}
                      className={cn(
                        "w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 flex items-center justify-center transition-all duration-200 relative",
                        !seat ? "opacity-0 pointer-events-none" : "hover:-translate-y-1 hover:shadow-md shadow-sm",
                        isOccupied 
                          ? "bg-[#FFF9C4] border-[#D4D4D4] text-[#333333]" 
                          : "bg-background border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5",
                        isHighlighted && "ring-4 ring-primary ring-offset-2 bg-[#FFF9C4] border-primary",
                        readOnly && !isOccupied && "opacity-50"
                      )}
                    >
                      {isOccupied ? (
                        <div className="flex flex-col items-center p-1 w-full h-full justify-between">
                          <div className="text-[10px] font-bold text-muted-foreground self-start px-1 uppercase tracking-tighter">Add Text</div>
                          <div className="flex flex-col items-center justify-center flex-1">
                            {isHighlighted && (
                              <CheckCircle2 className="w-4 h-4 text-primary absolute top-1 right-1" />
                            )}
                            <span className="text-xs font-mono font-bold truncate max-w-[60px] leading-tight text-center">
                              {seat?.studentId}
                            </span>
                          </div>
                          <div className="text-[8px] font-medium text-muted-foreground self-end px-1 italic">Vedika Varma</div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/30 font-mono">
                          {row+1}-{col+1}
                        </span>
                      )}
                    </button>
                    
                    {/* Tooltip for seat details */}
                    {!readOnly && seat && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        Row {row + 1} Col {col + 1}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
