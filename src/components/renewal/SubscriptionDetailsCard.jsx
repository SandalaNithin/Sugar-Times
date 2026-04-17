"use client";

import { AlertCircle, CheckCircle2, Clock, User, CreditCard, Calendar, MapPin, Phone, Mail, Building, Map, Hash, Star } from "lucide-react";

const STATUS_CONFIG = {
  active: {
    label: "Active",
    emoji: "\ud83d\udfe2",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
  },
  expiring: {
    label: "Expiring Soon",
    emoji: "\ud83d\udfe1",
    bg: "bg-amber-50",
    border: "border-amber-300",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    icon: Clock,
    iconColor: "text-amber-600",
  },
  expired: {
    label: "Expired",
    emoji: "\ud83d\udd34",
    bg: "bg-red-50",
    border: "border-red-300",
    badge: "bg-red-100 text-red-800 border-red-300",
    icon: AlertCircle,
    iconColor: "text-red-600",
  },
};

function getStatusKey(status) {
  if (!status) return "expired";
  const s = status.toLowerCase();
  if (s.includes("active") && !s.includes("expir")) return "active";
  if (s.includes("expiring")) return "expiring";
  return "expired";
}

const PLAN_LABELS = {
  "1year": "1 Year",
  "2year": "2 Years",
  "3year": "3 Years",
  "life": "Lifetime",
  "monthly": "Monthly",
  "yearly": "Yearly",
};

export default function SubscriptionDetailsCard({ subscription }) {
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const statusKey = getStatusKey(subscription.status);
  const config = STATUS_CONFIG[statusKey];
  const StatusIcon = config.icon;

  const fields = [
    { icon: CreditCard, label: "Member No.", value: subscription.memberNumber || subscription._id },
    { icon: User, label: "Name", value: subscription.name || subscription.subscriberName },
    { icon: Star, label: "Plan", value: PLAN_LABELS[subscription.plan] || subscription.plan, bold: true },
    {
      icon: CreditCard,
      label: "Subscription Type",
      value: subscription.subscriptionType === "print" ? "Print / Courier" : "E-Magazine / Digital",
    },
    { icon: Calendar, label: "Start Date", value: formatDate(subscription.startDate) },
    { icon: Calendar, label: "Valid Upto", value: formatDate(subscription.validUpto || subscription.endDate), bold: true },
    { icon: MapPin, label: "Delivery Address", value: subscription.deliveryAddress || subscription.address },
    { icon: Building, label: "District", value: subscription.district },
    { icon: Map, label: "State", value: subscription.state },
    { icon: Hash, label: "Pincode", value: subscription.pincode },
    { icon: Phone, label: "Registered Mobile", value: subscription.registeredMobile || subscription.mobile },
    { icon: Mail, label: "Registered Email", value: subscription.registeredEmail || subscription.email },
  ];

  return (
    <div className={`${config.bg} border-2 ${config.border} rounded-2xl overflow-hidden mb-14`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-slate-200/60">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <StatusIcon className={`w-5 h-5 ${config.iconColor}`} />
          Your Subscription Details
        </h3>
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${config.badge}`}>
          <span>{config.emoji}</span>
          <span>{config.label}</span>
        </div>
      </div>

      {/* Details Table */}
      <div className="px-6 md:px-8 py-5">
        <div className="bg-white/70 rounded-xl border border-slate-200/60 overflow-hidden">
          {fields.map((field, idx) => {
            const Icon = field.icon;
            const val = field.value;
            if (!val && val !== 0) return null;
            return (
              <div
                key={idx}
                className={`flex items-start gap-4 px-5 py-3.5 ${idx !== fields.length - 1 ? "border-b border-slate-100" : ""} hover:bg-white/80 transition-colors`}
              >
                <Icon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="w-36 flex-shrink-0">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wide">{field.label}</span>
                </div>
                <div className="flex-1">
                  <span className={`text-sm ${field.bold ? "font-black text-slate-900" : "font-medium text-slate-700"}`}>
                    {val}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer notice */}
      <div className="px-6 md:px-8 pb-5">
        <p className="text-xs text-slate-500">
          If any details are incorrect, please contact us on{" "}
          <a href="tel:+917355453462" className="font-bold text-emerald-600 hover:underline">
            +91 7355453462
          </a>{" "}
          or email{" "}
          <a href="mailto:info@sugartimes.co.in" className="font-bold text-emerald-600 hover:underline">
            info@sugartimes.co.in
          </a>{" "}
          to update before renewing.
        </p>
      </div>
    </div>
  );
}
