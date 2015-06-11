# News

## 0.4.0: 2015-06-29 (planned)

 * General
   * Local comments becomes disabled by default.
     Now you have to specify `--enable-local-comment` option to activate the UI and endpoint.
   * Schema is changed.
     * Now actor's metadata is stored into another `Actors` table.
     * New column `tags` is introduced and `scope` is migrated to a tag.
     * Migration script `migrate-0.3.0-to-0.4.0` is now available.
   * The navigation bar is fixed on the top.
   * A menu button is available in the navigation bar for narrow screens.
   * Timestamp filters can be applied more easily.
     You don't have to calculate UNIX time manually anymore.

## 0.3.0: 2015-06-06

 * General
   * Missing table definition of sample configuration for fluent-plugin-groonga has been fixed.
 * Timeline view
   * Comment link of dynamically inserted items now have correct destination.
   * Rightside column items are shrunken only when the screen is wider than 992px.
 * Archive view
   * Minor class events and events of minor class actors are shown with muted visual.
   * Navigation items in each event are shown in rightside.

## 0.2.0: 2015-06-02

 * General
   * Title of events are shown in the view.
   * Timestamp of events is shown in simple format.
   * Scope-related icon is shown for each event.
   * Temporary comments can be added for any event, even if it has its own `reply_uri`.
   * The directory `database/` is excluded from the package.
 * Timeline view
   * Metadata links of events are correctly clickable.
 * Archive view
   * Query parameters `offset` and `limit` are available.

## 0.1.0: 2015-05-29

 * Initial release.
