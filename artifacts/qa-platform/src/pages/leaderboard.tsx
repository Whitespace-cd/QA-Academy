import React from 'react';
import { useGetLeaderboard } from '@workspace/api-client-react';
import { useAuth } from '@/hooks/use-auth';
import { PageLoader, Card, Badge } from '@/components/ui';
import { Trophy, Medal, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useGetLeaderboard({ limit: 50 });
  const { user } = useAuth();

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="text-center py-10 rounded-3xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20">
        <Trophy className="h-16 w-16 text-amber-500 mx-auto mb-4" />
        <h1 className="text-4xl font-display font-bold mb-2">Global Leaderboard</h1>
        <p className="text-muted-foreground text-lg">Top QA Engineers ranking by Experience Points (XP)</p>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 text-sm uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="p-4 font-semibold text-center w-20">Rank</th>
                <th className="p-4 font-semibold">Engineer</th>
                <th className="p-4 font-semibold text-center hidden md:table-cell">Level</th>
                <th className="p-4 font-semibold text-center hidden sm:table-cell">Badges</th>
                <th className="p-4 font-semibold text-right">Total XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leaderboard?.map((entry) => {
                const isCurrentUser = entry.userId === user?.id;
                
                return (
                  <tr 
                    key={entry.userId} 
                    className={cn(
                      "transition-colors hover:bg-secondary/30",
                      isCurrentUser && "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    <td className="p-4 text-center font-display font-bold text-lg">
                      {entry.rank === 1 ? <Medal className="h-6 w-6 text-amber-400 mx-auto" /> : 
                       entry.rank === 2 ? <Medal className="h-6 w-6 text-slate-300 mx-auto" /> : 
                       entry.rank === 3 ? <Medal className="h-6 w-6 text-amber-700 mx-auto" /> : 
                       <span className="text-muted-foreground">#{entry.rank}</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-white shadow-sm">
                          {entry.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            {entry.name}
                            {isCurrentUser && <Badge variant="outline" className="text-[10px] py-0 h-4 border-primary text-primary">YOU</Badge>}
                          </div>
                          <div className="text-xs text-muted-foreground md:hidden mt-0.5">Lvl {entry.level}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center hidden md:table-cell">
                      <div className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-secondary text-sm font-bold">
                        {entry.level}
                      </div>
                    </td>
                    <td className="p-4 text-center hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Star className="h-4 w-4 text-amber-500" />
                        <span className="font-medium text-foreground">{entry.badgesCount}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-primary text-lg">
                      {entry.totalScore.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
