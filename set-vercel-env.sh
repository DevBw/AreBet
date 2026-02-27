#!/bin/bash
# Script to set Vercel environment variables
# Run this with: bash set-vercel-env.sh

vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://fpddrzlcqxkduvidivbc.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_URL preview <<< "https://fpddrzlcqxkduvidivbc.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_URL development <<< "https://fpddrzlcqxkduvidivbc.supabase.co"

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZGRyemxjcXhrZHV2aWRpdmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNjIzMDUsImV4cCI6MjA4NzczODMwNX0.tWLuZblEQj2uTV3oxCV6M4doGvej732sPGlO_nURsXQ"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZGRyemxjcXhrZHV2aWRpdmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNjIzMDUsImV4cCI6MjA4NzczODMwNX0.tWLuZblEQj2uTV3oxCV6M4doGvej732sPGlO_nURsXQ"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZGRyemxjcXhrZHV2aWRpdmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNjIzMDUsImV4cCI6MjA4NzczODMwNX0.tWLuZblEQj2uTV3oxCV6M4doGvej732sPGlO_nURsXQ"

vercel env add API_FOOTBALL_KEY production <<< "b02b82a347071022caa67135622b731c"
vercel env add API_FOOTBALL_KEY preview <<< "b02b82a347071022caa67135622b731c"
vercel env add API_FOOTBALL_KEY development <<< "b02b82a347071022caa67135622b731c"

vercel env add NEXT_PUBLIC_USE_DEMO_DATA production <<< "false"
vercel env add NEXT_PUBLIC_USE_DEMO_DATA preview <<< "true"
vercel env add NEXT_PUBLIC_USE_DEMO_DATA development <<< "true"

echo "Environment variables set! Now redeploy with: vercel --prod"
