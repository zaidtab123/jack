export interface eventSchema {
  slug: string;
  name: string;
  enabled: boolean;
  certificate: {
    x: number;
    y: number;
    maxWidth: number;
    maxHeight: number;
    url: string;
  };
  ledgerChannel: number;
}
