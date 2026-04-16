import { serve } from 'https://deno.fresh.dev/server/serve.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get auth user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    await req.json(); // still parse the body but we don't need any parameters

    // Fetch user's flashcard sets without limit
    const { data: flashcardSets, error: flashcardsError } = await supabaseClient
      .from('flashcard_sets_normalized')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (flashcardsError) {
      console.error('❌ [get-recent-activity] Error fetching flashcard sets:', flashcardsError);
      throw flashcardsError;
    }

    console.log(`📊 [get-recent-activity] Found ${flashcardSets?.length || 0} flashcard sets for user ${user.id}`);

    // Debug user ID
    console.log('🔍 [get-recent-activity] Current user ID:', user.id);
    
    // Get total quiz count to verify table access
    const { count: totalQuizCount, error: countError } = await supabaseClient
      .from('quizzes_normalized')
      .select('*', { count: 'exact', head: true });
    
    console.log('📊 [get-recent-activity] Total quizzes in DB:', totalQuizCount, 'count error:', countError);
    
    // Test query to check if we can access quizzes table at all
    const { data: testQuizzes, error: testError } = await supabaseClient
      .from('quizzes_normalized')
      .select('id, user_id, title, created_at')
      .limit(5);
    
    console.log('🔍 [get-recent-activity] Test query result:', testQuizzes?.length, 'error:', testError);
    if (testQuizzes && testQuizzes.length > 0) {
      console.log('🔍 [get-recent-activity] Sample quiz user_ids:', testQuizzes.map((q: any) => q.user_id));
      console.log('🔍 [get-recent-activity] Sample quiz titles:', testQuizzes.map((q: any) => q.title));
      console.log('🔍 [get-recent-activity] Does any quiz belong to current user?', testQuizzes.some((q: any) => q.user_id === user.id));
    }
    
    // Fetch user's quizzes without limit
    const { data: quizzes, error: quizzesError } = await supabaseClient
      .from('quizzes_normalized')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false});

    if (quizzesError) {
      console.error('❌ [get-recent-activity] Error fetching quizzes:', quizzesError);
      throw quizzesError;
    }

    console.log(`📊 [get-recent-activity] Found ${quizzes?.length || 0} quizzes for user ${user.id}`);
    console.log('📋 [get-recent-activity] Raw quizzes data:', JSON.stringify(quizzes, null, 2));

    // Transform flashcard sets into activities format
    const flashcardActivities = (flashcardSets || []).map((set: any) => ({
      id: set.id,
      type: 'flashcard_set',
      title: set.title || 'Untitled Flashcard Set',
      description: `${set.total_questions || 0} cards - ${set.difficulty_level || 'Standard'}`,
      timestamp: set.created_at,
      icon: 'Layers',
      data: {
        setId: set.id,
        totalCards: set.total_questions || 0,
        difficultyLevel: set.difficulty_level || 'Standard',
        format: set.question_type || 'Q&A',
        sourceType: set.source_type || 'unknown',
        sourceName: set.source_name || 'Unknown Source'
      }
    }));

    // Transform quizzes into activities format (with null safety)
    const quizActivities = (quizzes || []).map((quiz: any) => ({
      id: quiz.id,
      type: 'quiz',
      title: quiz.title || 'Untitled Quiz',
      description: `${quiz.total_questions || 0} questions - ${quiz.difficulty_level || 'Unknown'}`,
      timestamp: quiz.created_at,
      icon: 'HelpCircle',
      data: {
        quizId: quiz.id,
        questionCount: quiz.total_questions || 0,
        difficultyLevel: quiz.difficulty_level || 'Unknown',
        sourceType: quiz.source_type || 'unknown',
        sourceName: quiz.source_name || 'Unknown Source'
      }
    }));

    // Combine and sort all activities by timestamp
    // Debug activities before combining
    console.log(`📊 [get-recent-activity] Flashcard activities: ${flashcardActivities.length}`);
    console.log(`📊 [get-recent-activity] Quiz activities: ${quizActivities.length}`);
    if (quizActivities.length > 0) {
      console.log('📋 [get-recent-activity] Quiz activities detail:', JSON.stringify(quizActivities, null, 2));
    }
    
    // Combine all activities and sort by timestamp without any limit
    const allActivities = [...flashcardActivities, ...quizActivities];
    
    // Remove duplicates based on id and type
    const uniqueActivities = allActivities.filter((activity, index, self) => 
      index === self.findIndex(a => a.id === activity.id && a.type === activity.type)
    );
    
    const activities = uniqueActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    console.log(`📊 [get-recent-activity] Final activities count: ${activities.length}`);
    console.log('📋 [get-recent-activity] Final activity types:', activities.map((a: any) => a.type));

    return new Response(
      JSON.stringify({ 
        activities,
        success: true,
        debug: {
          userId: user.id,
          quizzesFound: quizzes?.length || 0,
          flashcardsFound: flashcardSets?.length || 0,
          quizActivitiesCount: quizActivities.length,
          flashcardActivitiesCount: flashcardActivities.length,
          totalActivities: activities.length
        },
        message: 'Recent activities fetched successfully' 
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        message: 'Error fetching recent activities' 
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});
