"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Truck, 
  Warehouse, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MapPin,
  Calendar,
  Package
} from "lucide-react";
import { useCarState } from "./use-car-state";

const statusConfig = {
  PICKED_UP: {
    label: "Picked Up",
    icon: Truck,
    color: "bg-blue-500",
    progress: 25,
    description: "Vehicle has been picked up from the auction"
  },
  IN_TRANSIT: {
    label: "In Transit",
    icon: Truck,
    color: "bg-yellow-500",
    progress: 50,
    description: "Vehicle is currently in transit"
  },
  WAREHOUSE: {
    label: "In Warehouse",
    icon: Warehouse,
    color: "bg-orange-500",
    progress: 75,
    description: "Vehicle is stored in warehouse"
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle,
    color: "bg-green-500",
    progress: 100,
    description: "Vehicle has been delivered"
  },
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "bg-gray-500",
    progress: 0,
    description: "Awaiting pickup"
  },
  UNKNOWN: {
    label: "Unknown",
    icon: AlertCircle,
    color: "bg-red-500",
    progress: 0,
    description: "Status unknown"
  }
};

export const CarStatusDisplay = () => {
  const { carData, carStatus, formatCarStatus } = useCarState();

  if (!carData) {
    return null;
  }

  const status = carStatus || 'UNKNOWN';
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.UNKNOWN;
  const IconComponent = config.icon;

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconComponent className="h-5 w-5" />
            Shipping Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={`${config.color} text-white`}>
                {config.label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {config.description}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{config.progress}%</div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
          
          <Progress value={config.progress} className="w-full" />
        </CardContent>
      </Card>

      {/* Car Details */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">VIN:</span>
              <span className="text-sm font-mono">{carData.vin}</span>
            </div>
            
            {carData.make && (
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Make:</span>
                <span className="text-sm">{carData.make}</span>
              </div>
            )}
            
            {carData.model && (
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Model:</span>
                <span className="text-sm">{carData.model}</span>
              </div>
            )}
            
            {carData.year && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Year:</span>
                <span className="text-sm">{carData.year}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {carData.color && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: carData.color.toLowerCase() }} />
                <span className="text-sm font-medium">Color:</span>
                <span className="text-sm">{carData.color}</span>
              </div>
            )}
            
            {carData.mileage && (
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Mileage:</span>
                <span className="text-sm">{carData.mileage.toLocaleString()} miles</span>
              </div>
            )}
            
            {carData.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Location:</span>
                <span className="text-sm">{carData.location}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(statusConfig).map(([key, statusInfo]) => {
              const isActive = key === status;
              const isCompleted = config.progress > statusInfo.progress;
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={key} className="flex items-center gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500 text-white' : 
                    isActive ? 'bg-blue-500 text-white' : 
                    'bg-gray-200 text-gray-500'
                  }`}>
                    <StatusIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        isActive ? 'text-blue-600' : 
                        isCompleted ? 'text-green-600' : 
                        'text-gray-500'
                      }`}>
                        {statusInfo.label}
                      </span>
                      {isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {statusInfo.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 