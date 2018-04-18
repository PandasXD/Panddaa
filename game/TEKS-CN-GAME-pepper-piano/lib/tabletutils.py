"""Helper functions for using the tablet.

Including:
* Wrappers for ALTabletService
* Operations to avoid any reference to an application's name

All these functions take a choregraphe box as first parameter, which
they mostly use to get the current application's name.

"""

import os

import naoqi

###############################
# Internal, helper functions  #
###############################

# This path should appear in application paths:
_APPS_FOLDER_FRAGMENT = os.path.join("PackageManager", "apps") 

def _get_appname(box):
    """Gets the name of the app to which the box belongs.
    
    Mostly a helper function for the rest.
    """
    behavior_id = box.behaviorId
    frame_manager = naoqi.ALProxy("ALFrameManager")
    behavior_path = os.path.normpath(frame_manager.getBehaviorPath(behavior_id))
    assert _APPS_FOLDER_FRAGMENT in behavior_path
    fragment = behavior_path.split(_APPS_FOLDER_FRAGMENT, 1)[1]
    return fragment.lstrip("\\/")

def _adapt_url(box, partial_url):
    """Tuns a relative URL into an absolue one including the app name.
    
    This allows us to use relative paths (inside the behavior's html
    folder) for most of this module's interface.
    """
    subpath = os.path.join(_get_appname(box),
                           os.path.normpath(partial_url).lstrip("\\/"))
    return "/apps/" + subpath.replace(os.path.sep, "/")

def _version_tuple(versiondesc):
    """A helper function, to correctly compare version numbers."""
    return tuple(map(int, versiondesc.split(".")))

###############################
# Public interface            #
###############################

def get_tablet_service(min_version=None):
    """Returns the ALTabletService object running on the tablet.
    
    This service greatly facilitates tablet communication, but is not
    present on old versions of the tablet.
    """
    try:
        tablet_service = naoqi.ALProxy("ALTabletService")
        if not min_version:
            return tablet_service
        elif _version_tuple(tablet_service.version()) >= _version_tuple(min_version):
            return tablet_service
        else:
            return None
    except RuntimeError:
        return None

def set_application(box):
    """Given an application's box, sets the application's webpage.
    
    The default page of a behavior is /html/index.html. In behavior
    'foo', calling set_application(self) will load the url
    /apps/foo/index.html on the tablet (the name 'foo' will be obtained
    from the box).
    """
    tablet_service = get_tablet_service()
    appname = _get_appname(box)
    if tablet_service:
        if tablet_service.loadApplication(appname):
            box.log("[DBG] Successfully set application: %s" % appname)
            return True
        else:
            # I could log a real error out of this, cause it's not normal...
            box.log("[Warning] Got tablet service, but failed to set "+\
                    "application: %s" % appname)
            return False
    else:
        box.log("[DBG] Couldn't find tablet service, so can't set "+\
                "application: %s" % appname)
        return False

def play_video(box, video_path):
    """Plays the video given a path in the behavior's 'html' folder
    
    For example, if your behavior has /html/videos/short/jump.mp4, then
    play_video(self, "videos/short/jump.mp4") will play it.
    """
    full_url = "http://198.18.0.1" + _adapt_url(box, video_path)
    tablet_service = get_tablet_service()
    if tablet_service:
        tablet_service.playVideo(full_url)

def stop_video(box, video_path):
    """Stops the video, if one is playing."""
    tablet_service = get_tablet_service()
    if tablet_service:
        tablet_service.stopVideo(full_url)

def set_absolute_url(box, full_url):
    """Sets an absolute url in the browser."""
    # Not handled in all browsers, will need to be implemented in javascript
    tablet_service = get_tablet_service()
    if tablet_service:
        tablet_service.loadUrl(full_url)
    box.log("[DBG] sent setURL = " + full_url);

def set_relative_url(box, sub_url):
    """Sets an relative url in the browser (in behavior's html folder)
    
    As usual, the first parameter is a box from the behavior."""
    full_url = _adapt_url(box, sub_url)
    return set_absolute_url(box, full_url)

def stop_video(box, video_path):
    """Stops the video, if one is playing."""
    tablet_service = get_tablet_service()
    if tablet_service:
        tablet_service.stopVideo(full_url)

def custom_message(box, key, value, *args):
    """Deprecated (use qimessaging now)."""
    box.log("[WARNING] custom_message is deprecated, use qimessaging now")

def show_webview(box):
    """Makes the webview visible.
    
    The webview will display the current webpage (or a white screen if
    there is none)."""
    tablet_service = get_tablet_service()
    if tablet_service:
        tablet_service.showWebview()

def hide_webview(box):
    """Makes the webview hidden behind a generic cover.
    
    This allows to change the page smoothly and invisibly, and show
    the webview again when the page is ready."""
    tablet_service = get_tablet_service()
    if tablet_service:
        tablet_service.hideWebview()
