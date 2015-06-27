# Sharetary

Sharetary is a cross-origin events viewer.
The name is neoterized from two terms "share" and "secretary".

This provides ability to watch various "events" stored into a Groonga server, in real time or analytically by two different views:

 * Timeline view - You can watch events in real time, like Twitter or something. Newly added events will appear on the top of the view automatically.
 * Archive view - You can watch events statically, with their relations. Related events are visible as a thread.


## How to start the server?

    $ sudo npm install -g sharetary
    $ sharetary-server

You must install Node.js and npm before installation.
For example, on Ubuntu 14.04LTS:

    $ sudo apt-get install nodejs nodejs-legacy npm

See `sharetary-server --help` for more details.


## How to crawl events?

Sharetary doesn't provide ability to crawl events from sources.
You need to crawl and load events by something other way.

In other words, you can use any data source for Sharetary, if you load them to the database in a common format described at this section.

Sharetary uses [Groonga](http://groonga.org) or [Droonga](http://droonga.org/) as its backend.
You simply have to define some tables with required columns (and load data to them):


### `Events` (`TABLE_HASH_KEY` or `TABLE_PAT_KEY`)

 * `_key` (any type):
   Something to identify each event uniquely.
   For example, URI string, hash string, or others.
 * `type` (`Text` or `ShortText`):
   Indicates the type of each event.
   For example, an event indicating a "push" activity on the GitHub will have the string `push` as its `type`.
 * `class` (`Text` or `ShortText`):
   Indicates the magnitude of each event.
   Three possible values: `important`, `major`, `normal`, and `minor`.
   `important` and `major` events will be highlighted in the view.
 * `tags` (vector of `Tags`):
   Indicates tags associated to events.
   For example, events from GitHub activities will belong to any repository, so their repository name is suitable as a tag.
 * `title` (`Text` or `ShortText`):
   Short description of each event.
   For example, an event indicating a "push" activity on the GitHub will have its `title` like: "Pushed N commits to the repository".
 * `description` (`Text` or `ShortText`):
   The main description of each event.
   For example, an event indicating a "commit" activity on the GitHub will have its commit message as its `description`.
 * `extra_description` (`Text` or `ShortText`):
   The extra description of each event.
   It won't be rendered in the view, but will be shown in the tooltip of events.
   For example, an event indicating a "commit" activity on the GitHub will have its "diff" as its `extra_description`.
 * `uri` (`Text` or `ShortText`):
   The related URI of each event.
 * `source_icon` (`Text` or `ShortText`):
   URI of the icon for the source of the event.
   For example, events from Github activities will have favicon's URI as its `soruce_icon`.
 * `reply_uri` (`Text` or `ShortText`):
   The URI of an UI to post any reply for each event.
   For example, an event indicating a "commit" activity on the GitHub will have link to the comment form of the commit as its `reply_uri`.
   If your crawler fetches posted comments from the UI also, then you'll see them as events related to the parent event.
 * `actor` (`Actors`):
   Indicates the actor's name of each event.
   For example, an events from GitHub activity will have the account id as its `actor`.
 * `timestamp` (`Time'):
   The time when the event was triggered at.
   Events are sorted by this field in the archive view.
 * `created_at` (`Time'):
   The time when the record of the event was loaded to the database.
   Events are sorted by this field in the timeline view.
 * `parent` (`Text` or `ShortText`):
   The `_key` of another event.
   For example, an event indicating a "issue comment" activity on the GitHub will have the `_key` of the "issue opened" event as its `parent`.

### `Tags` (`TABLE_HASH_KEY` or `TABLE_PAT_KEY`)

 * `icon` (`Text` or `ShortText`):
   URI of the icon for the tag.

### `Actors` (`TABLE_HASH_KEY` or `TABLE_PAT_KEY`)

 * `uri` (`Text` or `ShortText`):
   The related URI of the actor.
 * `icon` (`Text` or `ShortText`):
   URI of the icon for the actor.
 * `class` (`Text` or `ShortText`):
   Indicates the magnitude of the actor.
   Two possible values: `major`, `normal`, and `minor`.
   Events triggered by `minor` actors will be shown with small text and lighter color in the view.
   For example, if you have events triggered by both students and teachers and you hope to see students' events mainly, then students are `major` and teachers are `minor`.


See [the example schema](sample/schema.grn) also.

Any other column can be defined at each table table, as you like.
Moreover, of course, any other table is also allowed in the database.
Sharetary simply ignores them.


## Typical use case: watching users' activities on the GitHub

This section describes how to crawl GitHub activities by fluentd, on a Ubuntu 14.04 server.

 1. [Install Groonga with the instruction](http://groonga.org/docs/install/ubuntu.html).
    (If you have your existing Groonga or Droonga, you can skip this step.)
 2. Install fluentd and td-agent.
    
    ~~~
    $ sudo apt-get install ntp
    $ sudo service ntp restart
    $ curl -L http://toolbelt.treasuredata.com/sh/install-ubuntu-trusty-td-agent2.sh | sudo sh
    $ sudo mkdir -p /var/spool/td-agent/buffer/
    $ sudo chown -R td-agent:td-agent /var/spool/td-agent/
    ~~~
 3. Install required fluentd plugins.
    
    ~~~
    $ sudo td-agent-gem install fluent-plugin-github-activities
    $ sudo td-agent-gem install fluent-plugin-record-reformer
    $ sudo td-agent-gem install fluent-plugin-filter_typecast
    ~~~
 4. Install fluent-plugin-groonga. It requires some extra packages.
    
    ~~~
    $ sudo apt-get install ruby ruby-dev build-essential
    $ sudo td-agent-gem install fluent-plugin-groonga
    ~~~
 5. Configure td-agent.
    
    ~~~
    $ sudo vi /etc/td-agent/td-agent.conf
    ~~~
    
    See also [the example configuration to crawl and load GitHub activities](sample/fluent-plugin-github-activities.conf).
    It includes rules to convert fetched GitHub activities to Sharetary events.

    It is recommended to put your GitHub access token in `td-agent.conf`.
    You can obtain it [here](https://github.com/settings/tokens).
 6. Start td-agent.
    
    ~~~
    $ sudo service td-agent start
    ~~~

## How to customize exporting columns in CSV?

By default the link "CSV" in "Export" menu exports only some major columns.
If you need, you can customize columns of exported records.
Steps to change exporting columns are:

 1. Copy the link location of the menu item.
 2. Paste it to the location bar of your browser.
 3. Add new query parameter `columns` and load it.
    * Any columns of the `Events` table can be specified, like: `...&columns=title`
    * Multiple columns can be available as comma-separated list like: `...&columns=title,actor`
    * Special column name `*` (or `all`) is available to export all columns of the `Events` table.
