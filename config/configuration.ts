export default () => ({
  apiKey: process.env.API_KEY,
  supabase: {
    instanceUrl: process.env.SUPABASE_INSTANCE_URL,
    instanceKey: process.env.SUPABASE_INSTANCE_ANON_KEY,
    instanceServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }
});
