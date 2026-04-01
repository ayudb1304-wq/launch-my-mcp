export interface DemoTool {
  name: string;
  description: string;
  http_method: string;
  endpoint_path: string;
}

export interface DemoResult {
  tools: DemoTool[];
  demo_query: string;
  demo_response: string;
}

export interface DemoPreset {
  label: string;
  description: string;
  api_base_url: string;
  result: DemoResult;
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    label: "Restaurant reservations",
    description:
      "A tool that helps restaurants manage their reservations and waitlist",
    api_base_url: "https://api.tableready.io/v1",
    result: {
      tools: [
        {
          name: "search_reservations",
          description:
            "Use this when a user wants to find, check, or look up restaurant reservations by date, party size, or guest name.",
          http_method: "GET",
          endpoint_path: "/reservations/search",
        },
        {
          name: "create_booking",
          description:
            "Use this when a user wants to make a new restaurant reservation, book a table, or schedule a dinner.",
          http_method: "POST",
          endpoint_path: "/reservations",
        },
        {
          name: "get_waitlist",
          description:
            "Use this when a user asks about current wait times, waitlist status, or how busy a restaurant is right now.",
          http_method: "GET",
          endpoint_path: "/waitlist",
        },
        {
          name: "cancel_reservation",
          description:
            "Use this when a user needs to cancel or remove an existing reservation.",
          http_method: "DELETE",
          endpoint_path: "/reservations/{id}",
        },
      ],
      demo_query:
        "Can you help me find a table for 4 people this Friday evening?",
      demo_response:
        "I checked TableReady and found 3 available slots this Friday evening! There's a 7:00 PM opening for 4 at the main dining area, a 7:30 PM patio table, and an 8:00 PM booth. Would you like me to book one of these for you?",
    },
  },
  {
    label: "Invoice management",
    description:
      "A SaaS tool that helps freelancers create, send, and track invoices",
    api_base_url: "https://api.invoicehero.com/v1",
    result: {
      tools: [
        {
          name: "create_invoice",
          description:
            "Use this when a user wants to create a new invoice, bill a client, or generate a payment request.",
          http_method: "POST",
          endpoint_path: "/invoices",
        },
        {
          name: "list_invoices",
          description:
            "Use this when a user wants to see their invoices, check payment status, or find unpaid bills.",
          http_method: "GET",
          endpoint_path: "/invoices",
        },
        {
          name: "get_revenue_summary",
          description:
            "Use this when a user asks about their earnings, revenue, income, or financial overview.",
          http_method: "GET",
          endpoint_path: "/analytics/revenue",
        },
        {
          name: "send_reminder",
          description:
            "Use this when a user wants to remind a client about an unpaid invoice or send a payment nudge.",
          http_method: "POST",
          endpoint_path: "/invoices/{id}/remind",
        },
      ],
      demo_query: "Do I have any unpaid invoices this month?",
      demo_response:
        "I checked InvoiceHero and found 2 unpaid invoices this month. One is $1,200 from Acme Corp (sent 12 days ago) and another is $800 from StartupXYZ (sent 3 days ago). The Acme one is overdue — would you like me to send them a payment reminder?",
    },
  },
  {
    label: "Project management",
    description:
      "A project management tool for small teams to track tasks, deadlines, and progress",
    api_base_url: "https://api.taskflow.dev/v1",
    result: {
      tools: [
        {
          name: "list_tasks",
          description:
            "Use this when a user wants to see their to-do list, upcoming tasks, or what needs to be done.",
          http_method: "GET",
          endpoint_path: "/tasks",
        },
        {
          name: "create_task",
          description:
            "Use this when a user wants to add a new task, create a to-do item, or assign work.",
          http_method: "POST",
          endpoint_path: "/tasks",
        },
        {
          name: "get_project_status",
          description:
            "Use this when a user asks about project progress, how a project is going, or wants a status update.",
          http_method: "GET",
          endpoint_path: "/projects/{id}/status",
        },
        {
          name: "list_deadlines",
          description:
            "Use this when a user asks what's due soon, upcoming deadlines, or things that are overdue.",
          http_method: "GET",
          endpoint_path: "/tasks/deadlines",
        },
      ],
      demo_query: "What tasks are due this week for the website redesign?",
      demo_response:
        "I checked TaskFlow and found 4 tasks due this week on the Website Redesign project. Two are high priority: \"Finalize homepage mockups\" (due tomorrow) and \"Set up staging environment\" (due Thursday). The other two are \"Write landing page copy\" and \"Review brand guidelines\" — both due Friday. You're 65% through the project overall.",
    },
  },
  {
    label: "E-commerce analytics",
    description:
      "An analytics platform that helps online stores track sales, customers, and product performance",
    api_base_url: "https://api.metricsdash.io/v1",
    result: {
      tools: [
        {
          name: "get_sales_overview",
          description:
            "Use this when a user asks about their sales numbers, revenue, or how their store is performing.",
          http_method: "GET",
          endpoint_path: "/analytics/sales",
        },
        {
          name: "get_top_products",
          description:
            "Use this when a user wants to know their best-selling products, popular items, or top performers.",
          http_method: "GET",
          endpoint_path: "/analytics/products/top",
        },
        {
          name: "get_customer_insights",
          description:
            "Use this when a user asks about their customers, buying patterns, or audience demographics.",
          http_method: "GET",
          endpoint_path: "/analytics/customers",
        },
        {
          name: "compare_periods",
          description:
            "Use this when a user wants to compare sales between time periods, track growth, or see trends.",
          http_method: "GET",
          endpoint_path: "/analytics/compare",
        },
      ],
      demo_query: "How did my store do last month compared to the month before?",
      demo_response:
        "I pulled your MetricsDash analytics — great news! Last month you had $14,200 in sales, up 23% from the previous month. Your top seller was the \"Premium Starter Kit\" with 89 units sold. You also gained 34 new customers. The biggest growth came from mobile orders, which jumped 41%. Would you like a deeper breakdown by product category?",
    },
  },
];
