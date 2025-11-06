import { Fish } from 'lucide-react';

function FishingAnalysis({ recommendation }) {
  if (!recommendation) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className={`${recommendation.color} text-white p-5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Fish className="w-10 h-10 flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-xl font-bold leading-tight">{recommendation.recommendation}</h2>
              <p className="text-sm opacity-90 mt-0.5">钓鱼指数: {recommendation.level}</p>
            </div>
          </div>
          <div className="text-right ml-3">
            <div className="text-4xl font-bold leading-none">{recommendation.score}</div>
            <div className="text-sm opacity-90 mt-1">分</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {recommendation.reasons.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-2 text-sm">不利因素</h3>
            <ul className="space-y-1.5">
              {recommendation.reasons.map((reason, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {recommendation.tips.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-2 text-sm">提示建议</h3>
            <ul className="space-y-1.5">
              {recommendation.tips.map((tip, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default FishingAnalysis;
