import { Star } from 'lucide-react';
import { Review } from '@/types';
import { formatDate } from '@/utils/helpers';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-start gap-3 mb-3">
        <img 
          src={review.user.avatar} 
          alt={review.user.nickname}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-800">
              {review.user.nickname}
            </span>
            <span className="text-xs text-gray-400">
              {formatDate(review.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star 
                key={i}
                className={`w-4 h-4 ${
                  i <= review.rating 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 leading-relaxed">
        {review.content}
      </p>
      
      {review.images.length > 0 && (
        <div className="flex gap-2 mt-3">
          {review.images.map((img, i) => (
            <img 
              key={i}
              src={img}
              alt={`评价图片${i + 1}`}
              className="w-20 h-20 rounded-lg object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}