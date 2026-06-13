import { baseApi } from '@/shared/api';

type ValidateGithubTokenResponse = {
  status: 'valid';
};

const githubTokenApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    validateGithubTokenInput: build.mutation<ValidateGithubTokenResponse, string>({
      query: (githubToken) => ({
        headers: {
          'x-github-token': githubToken.trim(),
        },
        url: '/github/token/validate',
      }),
    }),
  }),
});

export const { useValidateGithubTokenInputMutation } = githubTokenApi;
