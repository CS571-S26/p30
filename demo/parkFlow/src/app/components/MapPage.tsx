import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Clock,
  Shield,
  AlertCircle,
  CheckCircle,
  Navigation,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ParkingLocation {
  id: number;
  name: string;
  lat: number;
  lng: number;
  price: string;
  available: number;
  total: number;
  streetAddress: string;
  timeLimit: string;
  whenEnforced: string;
  restriction: string;
  status: "Available" | "Limited" | "Full";
  sideOfStreet: string;
}

const parkingLocations: ParkingLocation[] = [
  {
    id: 1,
    name: "Capitol Square",
    lat: 43.0747,
    lng: -89.384,
    price: "$2/hr",
    available: 45,
    total: 120,
    streetAddress: "2 E Main St, Madison, WI 53703",
    timeLimit: "2 hours",
    whenEnforced: "Mon-Sat, 8am-6pm",
    restriction: "No parking during street cleaning",
    status: "Available",
    sideOfStreet: "North side",
  },
  {
    id: 2,
    name: "State Street Garage",
    lat: 43.0765,
    lng: -89.3892,
    price: "$1.50/hr",
    available: 78,
    total: 200,
    streetAddress: "215 N Carroll St, Madison, WI 53703",
    timeLimit: "No limit",
    whenEnforced: "24/7",
    restriction: "None",
    status: "Available",
    sideOfStreet: "West side",
  },
  {
    id: 3,
    name: "Overture Center",
    lat: 43.0742,
    lng: -89.3879,
    price: "$2.50/hr",
    available: 12,
    total: 150,
    streetAddress: "201 State St, Madison, WI 53703",
    timeLimit: "4 hours",
    whenEnforced: "Mon-Sun, 7am-11pm",
    restriction: "Event parking only after 6pm",
    status: "Limited",
    sideOfStreet: "South side",
  },
  {
    id: 4,
    name: "Library Mall",
    lat: 43.0753,
    lng: -89.3995,
    price: "$1.75/hr",
    available: 34,
    total: 90,
    streetAddress: "728 State St, Madison, WI 53706",
    timeLimit: "3 hours",
    whenEnforced: "Mon-Fri, 8am-5pm",
    restriction: "No overnight parking",
    status: "Available",
    sideOfStreet: "East side",
  },
  {
    id: 5,
    name: "Monona Terrace",
    lat: 43.072,
    lng: -89.381,
    price: "$2/hr",
    available: 56,
    total: 180,
    streetAddress: "1 John Nolen Dr, Madison, WI 53703",
    timeLimit: "No limit",
    whenEnforced: "24/7",
    restriction: "None",
    status: "Available",
    sideOfStreet: "Both sides",
  },
];

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] =
    useState<ParkingLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="relative h-full bg-gray-100">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4 bg-gradient-to-b from-white to-transparent">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Madison Parking
        </h1>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search parking locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm">
            <SlidersHorizontal className="size-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-full">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1590393820812-8a2ed3ece96f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwbWFwJTIwYWVyaWFsJTIwdmlld3xlbnwxfHx8fDE3NzU1NjQ1NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Madison City Map"
          className="w-full h-full object-cover"
        />

        {/* Parking Location Pins */}
        {parkingLocations.map((location, index) => {
          const availabilityPercent =
            (location.available / location.total) * 100;
          const pinColor =
            availabilityPercent > 50
              ? "#10b981"
              : availabilityPercent > 20
                ? "#f59e0b"
                : "#ef4444";

          return (
            <button
              key={location.id}
              onClick={() => setSelectedLocation(location)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 active:scale-95"
              style={{
                top: `${35 + index * 10}%`,
                left: `${40 + index * 8}%`,
              }}
            >
              {/* Pin marker */}
              <div className="relative">
                <div
                  className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: pinColor }}
                >
                  <span className="text-white font-bold text-sm">
                    ${location.price.replace("/hr", "")}
                  </span>
                </div>
                {/* Pin pointer */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[15px] border-transparent"
                  style={{ borderTopColor: pinColor }}
                />

                {/* Availability badge */}
                <div className="absolute -top-2 -right-2 bg-white rounded-full px-2 py-0.5 text-xs font-bold shadow-md border border-gray-200">
                  {location.available}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Location Card */}
      {selectedLocation && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[70vh] overflow-y-auto">
          <div className="sticky top-0 bg-white pt-4 px-6 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedLocation.name}
                </h2>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="size-4 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {selectedLocation.streetAddress}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="px-6 pb-6 space-y-4">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              {selectedLocation.status === "Available" && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full">
                  <CheckCircle className="size-4" />
                  <span className="text-sm font-semibold">
                    Available
                  </span>
                </div>
              )}
              {selectedLocation.status === "Limited" && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full">
                  <AlertCircle className="size-4" />
                  <span className="text-sm font-semibold">
                    Limited Spots
                  </span>
                </div>
              )}
              {selectedLocation.status === "Full" && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full">
                  <AlertCircle className="size-4" />
                  <span className="text-sm font-semibold">
                    Full
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-600">
                {selectedLocation.available} of{" "}
                {selectedLocation.total} spots
              </span>
            </div>

            {/* Information Grid */}
            <div className="space-y-3">
              {/* Time Limit */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Clock className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Time Limit
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {selectedLocation.timeLimit}
                  </p>
                </div>
              </div>

              {/* When Enforced */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Shield className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    When Enforced
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {selectedLocation.whenEnforced}
                  </p>
                </div>
              </div>

              {/* Restriction */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <AlertCircle className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Restriction
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {selectedLocation.restriction}
                  </p>
                </div>
              </div>

              {/* Side of Street */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Navigation className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Side of Street
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {selectedLocation.sideOfStreet}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-sm font-semibold text-gray-900">
                  Parking Rate
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {selectedLocation.price}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                Get Directions
              </button>
              <button className="px-6 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}