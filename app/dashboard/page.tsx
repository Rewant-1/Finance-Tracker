"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Users, LogOut, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Group {
  id: string;
  name: string;
  created_at: string;
  invite_code: string;
  member_count?: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const router = useRouter();

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/landing');
      return;
    }
    setUser(user);
    fetchGroups(user.id);
  };

  const fetchGroups = async (userId: string) => {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        groups (
          id,
          name,
          created_at,
          invite_code
        )
      `)
      .eq('user_id', userId);

    if (!error && data) {
      const groupsData = data
        .map(item => item.groups)
        .filter(Boolean)
        .flat() as Group[];
      setGroups(groupsData);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/landing');
        return;
      }
      setUser(user);
      fetchGroups(user.id);
    };
    
    checkUser();
  }, [router]);

  const createGroup = async () => {
    if (!newGroupName.trim() || !user) return;

    const inviteCode = Math.random().toString(36).substring(2, 15);
    
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .insert([{
        name: newGroupName,
        created_by: user.id,
        invite_code: inviteCode
      }])
      .select();

    if (!groupError && groupData && groupData[0]) {
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{
          group_id: groupData[0].id,
          user_id: user.id,
          role: 'admin'
        }]);

      if (!memberError) {
        setGroups(prev => [...prev, groupData[0]]);
        setShowCreateGroup(false);
        setNewGroupName('');
      }
    }
  };

  const joinGroup = async () => {
    if (!inviteCode.trim() || !user) return;

    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('invite_code', inviteCode)
      .single();

    if (!groupError && groupData) {
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{
          group_id: groupData.id,
          user_id: user.id
        }]);

      if (!memberError) {
        setGroups(prev => [...prev, groupData]);
        setShowJoinGroup(false);
        setInviteCode('');
      }
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/landing');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background dark:bg-background transition-colors duration-500">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              💕 Your Finance Groups
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Welcome back, {user.email}! Choose a group to manage expenses.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={signOut}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {groups.map((group) => (
            <Card 
              key={group.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700"
              onClick={() => router.push(`/group/${group.id}`)}
            >
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {group.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                  Created {new Date(group.created_at).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyInviteCode(group.invite_code);
                    }}
                    className="flex items-center gap-1"
                  >
                    {copiedCode === group.invite_code ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    Invite
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Create New Group Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-dashed border-2 border-slate-300 dark:border-slate-600"
            onClick={() => setShowCreateGroup(true)}
          >
            <CardContent className="flex flex-col items-center justify-center h-full py-12">
              <Plus className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Create New Group
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
                Start tracking expenses with your partner, friends, or roommates
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Join Group Button */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => setShowJoinGroup(true)}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Join Existing Group
          </Button>
        </div>

        {/* Create Group Modal */}
        {showCreateGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Create New Group</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Group name (e.g., 'Me & Sarah', 'Roommates')"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
                <div className="flex gap-3">
                  <Button onClick={createGroup} className="flex-1">
                    Create Group
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateGroup(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Join Group Modal */}
        {showJoinGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Join Group</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Enter invite code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
                <div className="flex gap-3">
                  <Button onClick={joinGroup} className="flex-1">
                    Join Group
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowJoinGroup(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
