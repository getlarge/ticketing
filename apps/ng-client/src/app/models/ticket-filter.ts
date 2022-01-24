export interface TicketFilter {
  userId: string | null;
  price: number | null;
  title: string | null;
  onlyMine: boolean | null;
  onlyOthers: boolean | null;
}
