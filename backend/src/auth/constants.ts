export const jwtConstants = {
  secret:
    process.env.JWT_ACCESS_TOKEN_SECRET ||
    process.env.JWT_SECRET ||
    'aquinattaayo',
};
