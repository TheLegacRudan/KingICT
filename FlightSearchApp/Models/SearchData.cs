namespace FlightSearchApp.Models
{
    public class SearchData
    {
        public required string OriginIATA { get; set; }
        public required string DestinationIATA { get; set; }
        public required DateTime DepartureDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public required int Adults { get; set; } = 1;
        public int Children { get; set; } = 0;
        public int Infants { get; set; } = 0;
        public string? CurrencyCode { get; set; }
    }
}
