package com.joshfire.android;

//import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.webkit.DownloadListener;
import android.webkit.WebView;

import com.phonegap.DroidGap;

public class App extends DroidGap {

	public static final String LOG_TAG = "JoshfireTag";

	public class VideoGapViewClient extends GapViewClient {

		public VideoGapViewClient(DroidGap ctx) {
			super(ctx);
		}

		@Override
		public boolean shouldOverrideUrlLoading(WebView view, String url) {
			Log.w(LOG_TAG, "should override Loading :" + url);
			if ((url.contains(".mp4") || url.contains(".m3u8"))
					&& (url.startsWith("http://") || url.startsWith("rtsp://"))) {

				Log.w(LOG_TAG, "detected MP4 to play");

				Intent intent = new Intent();
				intent.setAction(android.content.Intent.ACTION_VIEW);
				// regular video
				if (url.endsWith(".mp4"))
					intent.setDataAndType(Uri.parse(url), "video/mp4");
				else
					// paid videos
					intent.setData(Uri.parse(url));

				try {
					startActivity(intent);
				} catch (ActivityNotFoundException ex) {
					Log.w(LOG_TAG,
							"Couldn't find activity to view mimetype: mp4"
									+ ex.getStackTrace());
				}
			}

			return true;
		}
	}

	@Override
	public void init() {
		super.init();
		Log.w(LOG_TAG, "custom gap view client set");
		this.setWebViewClient(this.appView, new VideoGapViewClient(this));
	}

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {

		super.onCreate(savedInstanceState);
		// setContentView(R.layout.main);
		super.loadUrl("file:///android_asset/www/index.html");

		this.appView.setDownloadListener(new DownloadListener()

		{

			public void onDownloadStart(String url, String userAgent,
					String contentDisposition, String mimeType, long size)

			{

				Log.w(LOG_TAG, "onDownloadStart!!!");

				Intent viewIntent = new Intent(Intent.ACTION_VIEW);

				viewIntent.setDataAndType(Uri.parse(url), mimeType);

				try

				{

					startActivity(viewIntent);

				}

				catch (ActivityNotFoundException ex)

				{

					Log.w(LOG_TAG, "Couldn't find activity to view mimetype: "
							+ mimeType);

				}

			}

		});

	}
	/*
	 * // used to manage the back button, but Phonegap already provides this
	 * functionality
	 * 
	 * @Override public boolean onKeyDown(int keyCode, KeyEvent event) {
	 * 
	 * Log.d(LOG_TAG, Integer.toString(keyCode) ); // TODO : sent the RETURN
	 * event to the App if ((keyCode == KeyEvent.KEYCODE_BACK)) {
	 * //this.appView.goBack(); Log.d(LOG_TAG, "KEYCODE_BACK has been hit");
	 * return true; }
	 * 
	 * 
	 * return super.onKeyDown(keyCode, event); }
	 */
}