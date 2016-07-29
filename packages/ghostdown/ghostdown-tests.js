// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by ghostdown.js.
import { name as packageName } from "meteor/eli:ghostdown";

// Write your tests here!
// Here is an example.
Tinytest.add('ghostdown - example', function (test) {
  test.equal(packageName, "ghostdown");
});
