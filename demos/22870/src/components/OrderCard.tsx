import { Clock, MapPin, ChevronRight } from 'lucide-react';
import { Order } from '@/types';
import { orderStatusMap } from '@/utils/mockData';
import { formatServiceTime } from '@/utils/helpers';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

export default function OrderCard({ order, onClick }: OrderCardProps) {
  const statusInfo = orderStatusMap[order.status];
  
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        <img 
          src={order.skill.images[0]} 
          alt={order.skill.title}
          className="w-16 h-16 rounded-lg object-cover"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-medium text-gray-800 truncate">
              {order.skill.title}
            </h3>
            <span className={`status-badge ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatServiceTime(order.serviceTime)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{order.address}</span>
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-gray-300 self-center" />
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src={order.provider.avatar} 
            alt={order.provider.nickname}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-xs text-gray-600">{order.provider.nickname}</span>
        </div>
        <span className="text-sm font-medium text-primary">
          ¥{order.amount}
        </span>
      </div>
    </div>
  );
}