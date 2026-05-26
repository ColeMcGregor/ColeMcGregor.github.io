export const questionnaireConfig = {
  demoTarget: "demo.html",

  fallback: {
    businessId: "kraken-scuba",
    viewMode: "tabs",
    components: ["hero", "contactSection"],
  },

  questions: [
    {
      id: "site-purpose",
      prompt: "What should this website or system help with?",
      helper: "Select everything that applies. These choices decide the first demo setup.",
      type: "multi",
      options: [
        {
          id: "public-presence",
          label: "Represent a business, organization, or person",
          addsCapabilities: ["publicPresence"],
          addsComponents: ["hero", "aboutSection", "contactSection"],
        },
        {
          id: "products",
          label: "Show or sell products",
          addsCapabilities: ["productSales"],
          addsComponents: ["featuredProducts", "productCatalog"],
        },
        {
          id: "rentals",
          label: "Handle rentals or reservations",
          addsCapabilities: ["rentals"],
          addsComponents: ["rentalCatalog", "availabilityCalendar"],
        },
        {
          id: "classes",
          label: "Offer classes, lessons, or training",
          addsCapabilities: ["classes"],
          addsComponents: ["classSchedule"],
        },
        {
          id: "forms",
          label: "Collect forms, waivers, or customer information",
          addsCapabilities: ["intake"],
          addsComponents: ["waiverForm", "pickupRequest"],
        },
        {
          id: "internal-work",
          label: "Track internal work, inventory, or records",
          addsCapabilities: ["internalOps"],
          addsComponents: ["inventoryStatus", "adminDashboard"],
        },
      ],
    },

    {
      id: "business-fit",
      prompt: "Which example feels closest?",
      helper: "This chooses the starting data. The final demo can still be changed later.",
      type: "single",
      options: [
        {
          id: "kraken-scuba",
          label: "Dive shop with gear, rentals, classes, and waivers",
          businessId: "kraken-scuba",
          addsComponents: [
            "hero",
            "featuredProducts",
            "rentalCatalog",
            "availabilityCalendar",
            "classSchedule",
            "waiverForm",
            "contactSection",
          ],
        },
        {
          id: "cheese-shop",
          label: "Specialty food shop with products and pickup",
          businessId: "cheese-shop",
          addsComponents: [
            "hero",
            "featuredProducts",
            "productCatalog",
            "pickupRequest",
            "inventoryStatus",
            "contactSection",
          ],
        },
        {
          id: "bookstore",
          label: "Bookstore with products, events, and staff picks",
          businessId: "bookstore",
          addsComponents: [
            "hero",
            "featuredProducts",
            "productCatalog",
            "contactSection",
          ],
        },
        {
          id: "contractor",
          label: "Service business with quote requests and job tracking",
          businessId: "contractor",
          addsComponents: [
            "hero",
            "servicesSummary",
            "quoteRequest",
            "contactSection",
          ],
        },
      ],
    },

    {
      id: "view-mode",
      prompt: "How should the demo be shown first?",
      helper: "You can change this later in the demo controls.",
      type: "single",
      options: [
        {
          id: "tabs",
          label: "Tabbed pages",
          viewMode: "tabs",
        },
        {
          id: "stacked",
          label: "One scrolling page stack",
          viewMode: "stacked",
        },
      ],
    },
  ],
};