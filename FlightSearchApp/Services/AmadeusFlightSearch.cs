using FlightSearchApp.Models;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace FlightSearchApp.Services
{
    public class AmadeusFlightSearch(HttpClient _client, IConfiguration configuration)
    {
        private string? _accessToken;
        private DateTime _tokenExpiry = DateTime.MinValue;

        private async Task Authenticate()
        {
            Console.WriteLine("AmadeusFlightSearch -> Authenticate");

            if (_accessToken != null && DateTime.UtcNow < _tokenExpiry)
                return; // Token is still valid

            var clientId = configuration["Amadeus:ClientId"] ?? throw new Exception("Client ID is not set in the configuration.");
            var clientSecret = configuration["Amadeus:ClientSecret"] ?? throw new Exception("Client Secret is not set in the configuration.");

            var request = new HttpRequestMessage(HttpMethod.Post, "https://test.api.amadeus.com/v1/security/oauth2/token");
            var keyValues = new[]
            {
                new KeyValuePair<string, string>("grant_type", "client_credentials"),
                new KeyValuePair<string, string>("client_id", clientId),
                new KeyValuePair<string, string>("client_secret", clientSecret)
            };
            request.Content = new FormUrlEncodedContent(keyValues);

            var response = await _client.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var responseString = await response.Content.ReadAsStringAsync();
            var json = JsonNode.Parse(responseString);

            _accessToken = json?["access_token"]?.ToString() ?? throw new Exception("Access token not found.");
            var expiresIn = json?["expires_in"]?.GetValue<int>() ?? 3600;
            _tokenExpiry = DateTime.UtcNow.AddSeconds(expiresIn);
        }


        public async Task<object> SearchFlights(SearchData searchData)
        {
            Console.WriteLine("AmadeusFlightSearch -> SearchFlights");

            await Authenticate();

            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);

            var url = $"https://test.api.amadeus.com/v2/shopping/flight-offers" +
                  $"?originLocationCode={searchData.OriginIATA}" +
                  $"&destinationLocationCode={searchData.DestinationIATA}" +
                  $"&departureDate={searchData.DepartureDate:yyyy-MM-dd}" +
                  $"&adults={searchData.Adults}" +
                  $"{(searchData.ReturnDate.HasValue ? $"&returnDate={searchData.ReturnDate.Value:yyyy-MM-dd}" : "")}" +
                  $"&children={searchData.Children}" +
                  $"&infants={searchData.Infants}" +
                  $"&max=15"; 



            var response = await _client.GetAsync(url);
            var responseContent = await response.Content.ReadAsStringAsync();
            
            try
            {
                response.EnsureSuccessStatusCode();

                // Parse the response
                var json = JsonNode.Parse(responseContent);
                var data = json?["data"]?.AsArray();

                if (data == null) throw new Exception("No flight data available.");

                var flights = data.Select(flight => new
                {
                    searchData.OriginIATA,
                    searchData.DestinationIATA,
                    searchData.Adults,
                    searchData.Children,
                    searchData.Infants,
                    searchData.DepartureDate,
                    searchData.ReturnDate,
                    Id = flight?["id"]?.ToString() ?? "Unknown",
                    NumberOfBookableSeats = flight?["numberOfBookableSeats"]?.GetValue<int>() ?? 0,
                    Price = new
                    {
                        Currency = flight?["price"]?["currency"]?.ToString() ?? "N/A",
                        GrandTotal = flight?["price"]?["grandTotal"]?.ToString() ?? "0.00"
                    },
                    Itineraries = flight?["itineraries"]?.AsArray()?.Select(itinerary => new
                    {
                        Duration = ParseDuration(itinerary?["duration"]?.ToString() ?? string.Empty),
                        Stops = (itinerary?["segments"]?.AsArray()?.Count ?? 1) - 1
                    }) ?? Enumerable.Empty<object>()
                });

                return flights;
            }
            catch
            {
                using (JsonDocument doc = JsonDocument.Parse(responseContent))
                {
                    JsonElement root = doc.RootElement;

                    if (root.TryGetProperty("errors", out JsonElement errors) && errors.ValueKind == JsonValueKind.Array)
                    {
                        var firstError = errors[0];

                        if (firstError.TryGetProperty("title", out JsonElement title) &&
                            firstError.TryGetProperty("detail", out JsonElement detail) &&
                            firstError.TryGetProperty("status", out JsonElement status))
                        {
                            return new
                            {
                                Status = status.ToString(),
                                Error = title.GetString(),
                                Message = detail.GetString(),
                            };
                        }
                        else return new
                        {
                            Status = "500",
                            Error = "Unknown Error",
                            Message = "The server returned an invalid error response."
                        };
                    }
                    else return new
                    {
                        Status = "500",
                        Error = "Unknown Error",
                        Message = "The server returned an invalid error response."
                    };
                }
            }
        }

        private static string ParseDuration(string duration)
        {
            Console.WriteLine("AmadeusFlightSearch -> ParseDuration");

            if (string.IsNullOrWhiteSpace(duration))
                return "N/A"; // Return a default value for invalid durations

            // Regex to extract hours and minutes
            var match = System.Text.RegularExpressions.Regex.Match(duration, @"PT(?:(\d+)H)?(?:(\d+)M)?");
            if (!match.Success)
                return duration;

            var hours = match.Groups[1].Value;
            var minutes = match.Groups[2].Value;

            if (!string.IsNullOrEmpty(hours) && !string.IsNullOrEmpty(minutes))
                return $"{hours}h {minutes}m";
            if (!string.IsNullOrEmpty(hours))
                return $"{hours}h";
            if (!string.IsNullOrEmpty(minutes))
                return $"{minutes}m";

            return "N/A";
        }
    }
}
