CREATE TABLE public.roles (
    id SERIAL,
    name text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    owner character varying(255),
    application character varying(255),
    product character varying(255),
    sod_id character varying(255),
    description text,
    PRIMARY KEY (id)
);


CREATE TABLE IF NOT EXISTS public.permissions (
    id SERIAL,
    name text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    PRIMARY KEY (id)
);

-- need to drop the table otherwise it has a user_id field instead of username. It also won't have an extra_fields
DROP TABLE IF EXISTS public.users;
CREATE TABLE public.users (
    id SERIAL,
    user_id text NOT NULL,
    lastlogin timestamp with time zone,
    sandbox_id integer,
    disabled boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    cn text,
    first_name text,
    last_name text,
    organization text,
    email text,
    phone_number text,
    sub_office text,
    country text,
    state text,
    city text,
    job_title text,
    preferred_name text,
    extra_fields jsonb,
    is_super_admin boolean,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.roleperms (
    id SERIAL,
    roleid integer NOT NULL,
    permissionid integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (roleid) REFERENCES public.roles (id)
);

CREATE TABLE IF NOT EXISTS public.userroles (
    id SERIAL,
    userid integer NOT NULL,
    roleid integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (userid) REFERENCES public.users (id),
    FOREIGN KEY (roleid) REFERENCES public.roles (id)
);


