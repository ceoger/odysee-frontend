import { beforeAll, describe, expect, it } from 'vite-plus/test';

let selectRepliesForParentId: any;
let selectTopLevelCommentsForUri: any;

const BLOCKED_URL = 'lbry://@Blocked#a';
const FRIEND_URL = 'lbry://@Friend#b';
const CLAIM_ID = 'claim1';
const PARENT_ID = 'parent1';

const reply = (comment_id: string, channel_url: string, channel_id: string) => ({
  comment_id,
  channel_url,
  channel_id,
  claim_id: CLAIM_ID,
  parent_id: PARENT_ID,
  body: 'hi',
});

const makeState = (moderationBlockList: Array<string>) => ({
  claims: {
    byId: {},
    pendingById: {},
    myClaims: [],
    myChannelClaimsById: {},
    resolvingUris: [],
    claimsByUri: {},
  },
  comments: {
    commentById: {
      r1: reply('r1', BLOCKED_URL, 'blockedid'),
      r2: reply('r2', FRIEND_URL, 'friendid'),
    },
    repliesByParentId: { [PARENT_ID]: ['r1', 'r2'] },
    moderationBlockList,
    moderationDelegatorsById: {},
  },
  blocked: { blockedChannels: [], geoBlockedList: {} },
  blacklist: { blackListedOutpointMap: {} },
  filtered: { filteredOutpointMap: {} },
  settings: { clientSettings: {}, daemonSettings: {} },
  user: { locale: undefined },
});

beforeAll(async () => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { i18n_messages: {}, navigator: { language: 'en' } },
  });

  const comments = await import('../../ui/redux/selectors/comments');
  selectRepliesForParentId = comments.selectRepliesForParentId;
  selectTopLevelCommentsForUri = comments.selectTopLevelCommentsForUri;
});

describe('personal block list filtering', () => {
  it('hides replies from a blocked channel', () => {
    const state = makeState([BLOCKED_URL]);
    const replies = selectRepliesForParentId(state, PARENT_ID);
    expect(replies.map((c: any) => c.comment_id)).toEqual(['r2']);
  });

  it('keeps replies when nothing is blocked', () => {
    const state = makeState([]);
    const replies = selectRepliesForParentId(state, PARENT_ID);
    expect(replies.map((c: any) => c.comment_id)).toEqual(['r1', 'r2']);
  });

  it('exports the top-level selector it shares filtering with', () => {
    expect(typeof selectTopLevelCommentsForUri).toBe('function');
  });
});
