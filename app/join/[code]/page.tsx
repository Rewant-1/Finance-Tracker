"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Check, X } from 'lucide-react';

export default function JoinGroup() {
  const params = useParams();
  const router = useRouter();
  const inviteCode = params.code as string;
  
  const [user, setUser] = useState<any>(null);
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkAuthAndGroup = async () => {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/auth?redirect=/join/${inviteCode}`);
        return;
      }
      setUser(user);

      // Find group by invite code
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();

      if (groupError || !groupData) {
        setError('Invalid or expired invite link');
        setLoading(false);
        return;
      }

      setGroup(groupData);

      // Check if user is already a member
      const { data: memberData } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupData.id)
        .eq('user_id', user.id)
        .single();

      if (memberData) {
        // Already a member, redirect to group
        router.push(`/group/${groupData.id}`);
        return;
      }

      setLoading(false);
    };
    
    checkAuthAndGroup();
  }, [inviteCode, router]);

  const checkAuthAndGroup = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/auth?redirect=/join/${inviteCode}`);
      return;
    }
    setUser(user);

    // Find group by invite code
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('invite_code', inviteCode)
      .single();

    if (groupError || !groupData) {
      setError('Invalid or expired invite link');
      setLoading(false);
      return;
    }

    setGroup(groupData);

    // Check if user is already a member
    const { data: memberData } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupData.id)
      .eq('user_id', user.id)
      .single();

    if (memberData) {
      // Already a member, redirect to group
      router.push(`/group/${groupData.id}`);
      return;
    }

    setLoading(false);
  };

  const joinGroup = async () => {
    if (!user || !group) return;
    
    setJoining(true);
    setError('');

    const { error } = await supabase
      .from('group_members')
      .insert([{
        group_id: group.id,
        user_id: user.id,
        role: 'member'
      }]);

    if (error) {
      setError('Failed to join group. Please try again.');
      setJoining(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push(`/group/${group.id}`);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading invite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="text-center py-12">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">{error}</p>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="text-center py-12">
            <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              🎉 Welcome to the group!
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              You&apos;ve successfully joined &quot;{group?.name}&quot;. Redirecting you now...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <CardTitle className="text-slate-900 dark:text-white">
            Join &quot;{group?.name}&quot;
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <p className="text-slate-600 dark:text-slate-300 mb-2">
              You&apos;ve been invited to join this finance group!
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Start tracking shared expenses with your friends or partner.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={joinGroup} 
              disabled={joining}
              className="w-full"
            >
              {joining ? 'Joining...' : `Join ${group?.name}`}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
