```js
const {createAction} = require('dispersive-core/action');
const {createModel} = require('dispersive-core/model');
const {withTextField} = require('dispersive-core/field/text');
const {withMany} = require('dispersive-core/field/relation');

const Tweet = createModel(withTextField('text'));

const User = createModel(
  withTextField('name'),
  withMany('tweets', {model: Tweet, relatedName: 'user'}),
);

const tweets = User.objects.filter({name: 'hopefulcyborg'}).tweets;

const fetchTweets = createAction(async userName => {
  const user = User.objects.getOrCreate({userName});
  const res = await request.get(`http://twitter/api/user/${userName}/tweets`);

  res.body.forEach(tweet => user.tweets.add(tweet));
});

await fetchTweets('hopefulcyborg');
// End of action transaction:
// New version of Tweets.objects and User.objects has been created just now

tweets.map(tweet => console.log(tweet.text));
```
