const { supabaseAdmin } = require('../services/supabaseService');

exports.validateInviteCode = async (req, res) => {
    const { code, user_id } = req.body;
    if (!code) {
        return res.status(400).json({ valid: false, error: 'Invite code is required.' });
    }
    if (!supabaseAdmin) {
        return res.status(500).json({ valid: false, error: 'Supabase not configured.' });
    }
    try {
        const { data: invite, error } = await supabaseAdmin
            .from('invite_codes')
            .select('*')
            .eq('code', code)
            .is('used_by', null)
            .single();
        if (error || !invite) {
            return res.status(400).json({ valid: false, error: 'Invalid or already used invite code.' });
        }
        if (user_id) {
            const { error: updateError } = await supabaseAdmin
                .from('invite_codes')
                .update({ used_by: user_id, used_at: new Date().toISOString() })
                .eq('id', invite.id);
            if (updateError) {
                return res.status(500).json({ valid: false, error: 'Failed to mark invite code as used.' });
            }
        }
        return res.json({ valid: true });
    } catch (e) {
        return res.status(500).json({ valid: false, error: 'Server error.' });
    }
}; 