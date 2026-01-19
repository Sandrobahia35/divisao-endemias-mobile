import { supabase } from './supabaseClient';

export const ProfileService = {
    /**
     * Uploads an avatar image for the user and updates their profile.
     * @param userId The user's ID (profile ID)
     * @param file The image file to upload
     * @returns The public URL of the uploaded avatar
     */
    uploadAvatar: async (userId: string, file: File): Promise<string> => {
        try {
            // 1. Upload file to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                console.error('Error uploading avatar:', uploadError);
                throw uploadError;
            }

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Update Profile with new avatar_url
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    avatar_url: publicUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (updateError) {
                console.error('Error updating profile avatar:', updateError);
                throw updateError;
            }

            return publicUrl;
        } catch (error) {
            console.error('ProfileService.uploadAvatar error:', error);
            throw error;
        }
    }
};
