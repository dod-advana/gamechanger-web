DELETE FROM
    crawler_info
WHERE
    crawler = 'Army_Reserve'
    OR crawler = 'Bupers_Crawler'
    OR crawler = 'CNSS'
    OR crawler = 'DOD_Coronavirus_Guidance'
    OR crawler = 'far_subpart_regs'
    OR crawler = 'HASC'
    OR crawler = 'maradmin_pubs'
    OR crawler = 'navy_cac_pubs'
    OR crawler = 'navy_personnel_messages'
    OR crawler = 'SASC'
    OR crawler = 'stig_pubs'
    OR crawler = 'stratcom'
    OR crawler = 'tradoc'
    OR crawler = 'whs_pubs'
    OR crawler = 'DCMA';

INSERT INTO
    crawler_info(
        crawler,
        source_title,
        display_org,
        url_origin,
        image_link,
        data_source_s
    )
VALUES
    (
        'Army_Reserve',
        'U.S. Army Reserve Publications',
        'Dept. of the Army',
        'https://www.usar.army.mil/Publications/',
        'none',
        'Army Publishing Directorate'
    ),
    (
        'Bupers_Crawler',
        'Bureau of Naval Personnel Instructions',
        'US Navy',
        'https://www.mynavyhr.navy.mil/References/Instructions/BUPERS-Instructions/',
        'none',
        'Mynavy HR'
    ),
    (
        'CNSS',
        'none',
        'Dept. of Defense',
        'https://www.cnss.gov/CNSS/index.cfm',
        'none',
        'CNSS'
    ),
    (
        'DOD_Coronavirus_Guidance',
        'none',
        'Dept. of Defense',
        'https://www.defense.gov/Explore/Spotlight/Coronavirus/Latest-DOD-Guidance/',
        'none',
        'DoD Coronavirus Guidance'
    ),
    (
        'far_subpart_regs',
        'none',
        'FAR',
        'https://www.acquisition.gov/far',
        'none',
        'Federal Acquisition Regulation'
    ),
    (
        'HASC',
        'none',
        'Congress',
        'https://armedservices.house.gov/hearings?page=1',
        'none',
        'HASC'
    ),
    (
        'maradmin_pubs',
        'none',
        'US Marine Corps',
        'https://www.marines.mil/News/Messages/MARADMINS/Customstatus/4000/',
        'none',
        'Marine Corps Publications Electronic Library'
    ),
    (
        'navy_cac_pubs',
        'none',
        'US Navy',
        'https://portal.secnav.navy.mil/orgs/OPNAV/DNS/DNS1/DNS15/FOUO%20Directives/Forms/AllItems.aspx?RootFolder=%2Forgs%2FOPNAV%2FDNS%2FDNS1%2FDNS15%2FFOUO%20Directives%2FDirectives&FolderCTID=0x0120009220AC00C6A6C342931E74D5948CAF26&View=%7B548ECDB9%2DB0C3%2D49C7%2D8C3F%2DC2C1EA086FC1%7D',
        'none',
        'Navy Publications'
    ),
    (
        'navy_personnel_messages',
        'none',
        'US Navy',
        'https://www.mynavyhr.navy.mil/References/Messages/',
        'none',
        'Navy Personnel Messages'
    ),
    (
        'SASC',
        'none',
        'Congress',
        'https://www.armed-services.senate.gov/hearings?PageNum_rs=1&c=all',
        'none',
        'SASC'
    ),
    (
        'stig_pubs',
        'none',
        'Defense Information Systems Agency',
        'https://public.cyber.mil/stigs/downloads/',
        'none',
        'STIGs Document Library'
    ),
    (
        'stratcom',
        'none',
        'Dept. of Defense',
        'https://dod365.sharepoint-mil.us/sites/stratcom-publications',
        'none',
        'STRATCOM'
    ),
    (
        'tradoc',
        'none',
        'United States Army Training and Doctrine Command',
        'https://adminpubs.tradoc.army.mil/index.html',
        'none',
        'TRADOC'
    ),
    (
        'whs_pubs',
        'WHS DoD Directives Division',
        'Dept. of Defense',
        'https://directives.whs.mil/memorandums.html',
        'none',
        'Dept. of Defense'
    ),
    (
        'DCMA',
        'DCMA Policy',
        'Dept. of Defense',
        'https://www.dcma.mil/Policy/ ',
        'none',
        'Defense Contract Management Agency Policy Publications'
    )
;