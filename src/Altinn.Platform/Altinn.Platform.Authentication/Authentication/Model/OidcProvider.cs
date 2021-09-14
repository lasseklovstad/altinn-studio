namespace Altinn.Platform.Authentication.Model
{
    /// <summary>
    /// Oidc provider config
    /// </summary>
    public class OidcProvider
    {
        /// <summary>
        /// The OIDC issuer in token
        /// </summary>
        public string Issuer { get; set; }

        /// <summary>
        /// The authorization endpoint
        /// </summary>
        public string AuthorizationEndpoint { get; set; }

        /// <summary>
        /// Token endpoint
        /// </summary>
        public string TokenEndpoint { get; set; }

        /// <summary>
        /// Issuer key
        /// </summary>
        public string IssuerKey { get; set; }

        /// <summary>
        /// Well known endpoint
        /// </summary>
        public string WellKnownConfigEndpoint { get; set; }

        /// <summary>
        /// Scope to request
        /// </summary>
        public string Scope { get; set; } = "openid";

        /// <summary>
        /// The client Id
        /// </summary>
        public string ClientId { get; set; }

        /// <summary>
        /// The client secret
        /// </summary>
        public string ClientSecret { get; set; }

        /// <summary>
        /// The response type
        /// </summary>
        public string ResponseType { get; set; } = "code";

        /// <summary>
        /// A list of non standard claims that should be copied to 
        /// </summary>
        public string ClaimsToCopyTo { get; set; }

        /// <summary>
        /// A list of claims that need to be forwarded to Altinn token
        /// </summary>
        public string[] ProviderClaims { get; set; }

        /// <summary>
        /// The claim to use for external identity if
        /// </summary>
        public string ExternalIdentityClaim { get; set; }
    }
}
