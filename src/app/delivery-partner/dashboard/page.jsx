
"use client";

import { useEffect, useRef, useState } from "react";
import {
    Wallet,
    PackageCheck,
    Clock3,
    TrendingUp,
    Bike,
    ArrowRight,
    Zap,
    CalendarDays,
    MapPin,
    LoaderCircle,
    Power,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";

const stats = [
    {
        label: "Today's Earnings",
        value: "₹0",
        description: "Your daily income",
        icon: Wallet,
        color: "bg-green-50 text-green-600",
    },
    {
        label: "Completed Deliveries",
        value: "0",
        description: "Today's completed orders",
        icon: PackageCheck,
        color: "bg-blue-50 text-blue-600",
    },
    {
        label: "Pending Deliveries",
        value: "0",
        description: "Orders to complete",
        icon: Clock3,
        color: "bg-orange-50 text-orange-600",
    },
    {
        label: "Weekly Earnings",
        value: "₹0",
        description: "This week's income",
        icon: TrendingUp,
        color: "bg-purple-50 text-purple-600",
    },
];

function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(
                new Error("Geolocation is not supported by your browser.")
            );
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        reject(
                            new Error(
                                "Location permission denied. Please allow location access."
                            )
                        );
                        break;

                    case error.POSITION_UNAVAILABLE:
                        reject(
                            new Error("Your current location is unavailable.")
                        );
                        break;

                    case error.TIMEOUT:
                        reject(
                            new Error("Location request timed out. Please try again.")
                        );
                        break;

                    default:
                        reject(new Error("Unable to fetch your location."));
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            }
        );
    });
}

export default function DeliveryPartnerDashboard() {
    const [isOnline, setIsOnline] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const lastLocationUpdateRef = useRef(0);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setProfileLoading(true);

                const response = await fetch(
                    "/api/v1/delivery-partner/me",
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message || "Unable to fetch profile."
                    );
                }

                setIsOnline(Boolean(data.profile?.isOnline));
            } catch (err) {
                setError(err.message);
            } finally {
                setProfileLoading(false);
            }
        };

        fetchProfile();
    }, []);

    
useEffect(() => {
  // Tracking only when partner is online.
  if (!isOnline) {
    lastLocationUpdateRef.current = 0;
    return;
  }

  if (!navigator.geolocation) {
    setError("Your browser does not support GPS tracking.");
    return;
  }

  let isMounted = true;

  const watchId = navigator.geolocation.watchPosition(
    async (position) => {
      if (!isMounted) return;

      const now = Date.now();

      // Prevent unnecessary API requests.
      if (now - lastLocationUpdateRef.current < 30000) {
        return;
      }

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      try {
        const response = await fetch(
          "/api/v1/delivery-partner/location",
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(location),
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to update live location."
          );
        }

        if (isMounted) {
          lastLocationUpdateRef.current = now;
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      }
    },
    (gpsError) => {
      if (!isMounted) return;

      if (gpsError.code === gpsError.PERMISSION_DENIED) {
        setError("GPS permission denied. Please allow location access.");
      } else if (gpsError.code === gpsError.POSITION_UNAVAILABLE) {
        setError("Your current GPS location is unavailable.");
      } else if (gpsError.code === gpsError.TIMEOUT) {
        setError("GPS location request timed out.");
      }
    },
    {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 20000,
    }
  );

  // Stop tracking when offline or component unmounts.
  return () => {
    isMounted = false;
    navigator.geolocation.clearWatch(watchId);
  };
}, [isOnline]);


    // Common API response handler
    const parseResponse = async (response) => {
        let data;

        try {
            data = await response.json();
        } catch {
            throw new Error("Invalid server response.");
        }

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Something went wrong. Please try again."
            );
        }

        return data;
    };

    // Go Online
    const handleGoOnline = async () => {
        if (loading) return;

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            // 1. Fetch current GPS location
            const location = await getCurrentLocation();

            // 2. Save location in database
            const locationResponse = await fetch(
                "/api/v1/delivery-partner/location",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(location),
                }
            );

            await parseResponse(locationResponse);

            // 3. Update availability
            const availabilityResponse = await fetch(
                "/api/v1/delivery-partner/availability",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        isOnline: true,
                    }),
                }
            );

            await parseResponse(availabilityResponse);

            setIsOnline(true);
            setSuccess("You are now online and ready to receive deliveries.");
        } catch (err) {
            setError(
                err.message || "Unable to go online. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Go Offline
    const handleGoOffline = async () => {
        if (loading) return;

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const response = await fetch(
                "/api/v1/delivery-partner/availability",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        isOnline: false,
                    }),
                }
            );

            await parseResponse(response);

            setIsOnline(false);
            setSuccess("You are now offline.");
        } catch (err) {
            setError(
                err.message || "Unable to go offline. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleAvailability = () => {
        if (isOnline) {
            handleGoOffline();
        } else {
            handleGoOnline();
        }
    };

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <section>
                <h1 className="text-2xl font-bold text-slate-900">
                    Welcome Back!
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Here's your delivery performance overview.
                </p>
            </section>

            {/* Availability Card */}
            <section
                className={`rounded-2xl p-6 text-white shadow-sm transition-colors ${isOnline
                        ? "bg-gradient-to-r from-green-600 to-green-500"
                        : "bg-gradient-to-r from-orange-600 to-orange-500"
                    }`}
            >
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <span
                                className={`h-2.5 w-2.5 rounded-full ${isOnline
                                        ? "animate-pulse bg-white"
                                        : "bg-white/80"
                                    }`}
                            />

                            <span className="text-sm font-medium text-white/90">
                                {isOnline
                                    ? "You're currently online"
                                    : "You're currently offline"}
                            </span>
                        </div>

                        <h2 className="text-xl font-bold sm:text-2xl">
                            {isOnline
                                ? "You're ready for deliveries!"
                                : "Ready to start earning?"}
                        </h2>

                        <p className="mt-2 max-w-lg text-sm text-white/90">
                            {isOnline
                                ? "You can now receive Express orders and Scheduled delivery batches."
                                : "Go online to receive Express orders and Scheduled delivery batches."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleAvailability}
                        disabled={loading || profileLoading}
                        className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-orange-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading || profileLoading ? (
                            <>
                                <LoaderCircle size={19} className="animate-spin" />
                                PLEASE WAIT
                            </>
                        ) : isOnline ? (
                            <>
                                <Power size={19} />
                                GO OFFLINE
                            </>
                        ) : (
                            <>
                                <Bike size={19} />
                                GO ONLINE
                            </>
                        )}
                    </button>
                </div>

                {/* Location Information */}
                <div className="mt-5 flex items-center gap-2 border-t border-white/20 pt-4 text-xs text-white/90">
                    <MapPin size={15} />
                    Location will be fetched automatically when you go online.
                </div>
            </section>

            {/* Success Message */}
            {success && (
                <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    <PackageCheck size={18} className="mt-0.5 shrink-0" />
                    <p>{success}</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {/* Stats */}
            <section>
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-slate-900">
                        Your Overview
                    </h2>
                    <p className="text-sm text-slate-500">
                        Your daily and weekly performance.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;

                        return (
                            <div
                                key={stat.label}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}
                                    >
                                        <Icon size={21} />
                                    </div>
                                </div>

                                <h3 className="mt-5 text-2xl font-bold text-slate-900">
                                    {stat.value}
                                </h3>

                                <p className="mt-1 text-sm font-medium text-slate-700">
                                    {stat.label}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    {stat.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Delivery Types */}
            <section>
                <h2 className="mb-4 text-lg font-bold text-slate-900">
                    Delivery Modes
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Zap size={22} />
                            </div>
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                EXPRESS
                            </span>
                        </div>

                        <h3 className="mt-4 text-lg font-bold text-slate-900">
                            Express Deliveries
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Receive individual orders for fast pickup and direct delivery.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                                <CalendarDays size={22} />
                            </div>
                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                SCHEDULED
                            </span>
                        </div>

                        <h3 className="mt-4 text-lg font-bold text-slate-900">
                            Scheduled Batches
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Deliver multiple compatible orders in one planned route.
                        </p>
                    </div>
                </div>
            </section>

            {/* Active Deliveries */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Active Deliveries
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Your currently assigned orders will appear here.
                        </p>
                    </div>

                    <Link
                        href="/delivery-partner/deliveries"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
                    >
                        View Deliveries
                        <ArrowRight size={17} />
                    </Link>
                </div>

                <div className="mt-6 flex flex-col items-center justify-center rounded-xl bg-slate-50 px-4 py-10 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                        <PackageCheck size={26} />
                    </div>

                    <h3 className="mt-4 font-semibold text-slate-800">
                        No active deliveries
                    </h3>

                    <p className="mt-1 max-w-sm text-sm text-slate-500">
                        Your accepted Express orders and Scheduled batches will appear here.
                    </p>
                </div>
            </section>
        </div>
    );
}
