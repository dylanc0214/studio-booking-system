export const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    next();
};
