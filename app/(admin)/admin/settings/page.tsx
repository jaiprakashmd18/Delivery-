export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Settings, Shield } from "lucide-react";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") redirect("/");

  const settingsRows = await prisma.appSettings.findMany();
  const settings = Object.fromEntries(settingsRows.map((s) => [s.key, s.value]));

  const sections = [
    {
      title: "App Information",
      items: [
        { key: "app_name", label: "App Name" },
        { key: "contact_email", label: "Contact Email" },
        { key: "contact_phone", label: "Contact Phone" },
        { key: "support_email", label: "Support Email" },
      ],
    },
    {
      title: "Delivery & Fees",
      items: [
        { key: "default_delivery_fee", label: "Default Delivery Fee" },
        { key: "min_order_amount", label: "Min Order Amount" },
        { key: "max_delivery_radius", label: "Max Delivery Radius (km)" },
        { key: "platform_commission", label: "Platform Commission (%)" },
      ],
    },
    {
      title: "Feature Toggles",
      items: [
        { key: "maintenance_mode", label: "Maintenance Mode" },
        { key: "allow_new_registrations", label: "New Registrations" },
        { key: "require_student_verification", label: "Student Verification Required" },
        { key: "cash_on_delivery_enabled", label: "Cash on Delivery" },
      ],
    },
    {
      title: "Social Links",
      items: [
        { key: "instagram_url", label: "Instagram" },
        { key: "facebook_url", label: "Facebook" },
        { key: "twitter_url", label: "Twitter/X" },
      ],
    },
  ];

  return (
    <div className="p-6 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground text-sm">Configure global platform settings</p>
      </div>

      {sections.map((section) => {
        const sectionItems = section.items.filter((item) => settings[item.key] !== undefined);
        if (section.title === "Feature Toggles" || section.title === "App Information" || section.title === "Delivery & Fees") {
          // Always show these sections
        } else if (sectionItems.length === 0) return null;

        return (
          <div key={section.title} className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Settings className="w-4 h-4" /> {section.title}
            </h3>
            {section.items.map(({ key, label }) => {
              const value = settings[key];
              const isBool = value === "true" || value === "false";
              if (!value && !isBool) {
                return (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm text-muted-foreground/50">Not configured</span>
                  </div>
                );
              }
              return (
                <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  {isBool ? (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${value === "true" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                      {value === "true" ? "Enabled" : "Disabled"}
                    </span>
                  ) : (
                    <span className="font-medium text-sm">{value}</span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {settingsRows.length === 0 && (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Settings className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No settings configured</h3>
          <p className="text-muted-foreground text-sm">Platform settings will appear here once configured.</p>
        </div>
      )}

      <div className="bg-muted/50 rounded-xl p-4 flex items-start gap-3 text-sm text-muted-foreground">
        <Shield className="w-4 h-4 shrink-0 mt-0.5" />
        <p>Settings are managed through the database. Contact your developer to modify platform configuration.</p>
      </div>
    </div>
  );
}
